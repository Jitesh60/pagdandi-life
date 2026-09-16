/**
 * Minimal WooCommerce Store API client for the ingest step.
 *
 * The origin sits behind a JS bot-challenge (hCDN). Plain requests get a 403
 * HTML challenge page rather than JSON, so every request carries a session
 * harvested from a solved browser session via PAGDANDI_COOKIE. This client is
 * used ONLY by `pnpm ingest` — never at build or request time.
 */

const BASE = "https://pagdandilife.com/wp-json/wc/store/v1";

export function sessionHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const cookie = process.env.PAGDANDI_COOKIE;
  const ua = process.env.PAGDANDI_UA;
  if (!cookie || !ua) {
    throw new Error(
      "Missing PAGDANDI_COOKIE / PAGDANDI_UA.\n" +
        "The source site is behind a bot-challenge. Harvest a fresh session from a\n" +
        "browser that has solved it, write it to .env.local, and re-run with\n" +
        "`node --env-file=.env.local`. See scripts/README.md.",
    );
  }
  return {
    "User-Agent": ua,
    Cookie: cookie,
    Referer: "https://pagdandilife.com/",
    "Accept-Language": "en-US,en;q=0.9",
    ...extra,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches with exponential backoff. Treats a non-JSON body as a challenge
 * response and retries, because the WAF answers 403 with HTML, not an error.
 */
async function fetchJson(url: string, attempts = 4): Promise<unknown> {
  let lastError = "";
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(1500 * 2 ** (attempt - 1));
    try {
      const response = await fetch(url, {
        headers: sessionHeaders({ Accept: "application/json" }),
      });
      const text = await response.text();
      if (!text.trimStart().startsWith("[") && !text.trimStart().startsWith("{")) {
        lastError = `HTTP ${response.status} — challenge page instead of JSON`;
        continue;
      }
      return JSON.parse(text);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(`Failed after ${attempts} attempts: ${url}\n  ${lastError}`);
}

/** Pages through every product. `per_page` stays modest to avoid rate limiting. */
export async function fetchAllProducts(perPage = 20): Promise<unknown[]> {
  const products: unknown[] = [];
  for (let page = 1; page <= 50; page++) {
    const batch = (await fetchJson(
      `${BASE}/products?per_page=${perPage}&page=${page}`,
    )) as unknown[];
    products.push(...batch);
    process.stdout.write(`\r  products: ${products.length}`);
    if (batch.length < perPage) break;
    await sleep(600);
  }
  process.stdout.write("\n");
  return products;
}

export async function fetchAllCategories(): Promise<unknown[]> {
  return (await fetchJson(`${BASE}/products/categories?per_page=100`)) as unknown[];
}
