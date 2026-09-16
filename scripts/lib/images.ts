/**
 * Downloads product imagery and rewrites it as local, optimised assets.
 *
 * This exists because the source origin is behind a bot-challenge: remote
 * images 403 for ordinary clients, so `next/image` could not optimise them and
 * hotlinking would fail for real visitors. Pulling them local also lets us
 * generate the LQIP placeholders the storefront uses as image skeletons.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { sessionHeaders } from "./woo-client.ts";
import type { ProductImage } from "../../src/lib/catalog/types.ts";

const OUTPUT_ROOT = path.join(process.cwd(), "public", "catalog");
/** Product pages show a gallery, but a dozen near-duplicates helps nobody. */
export const MAX_IMAGES_PER_PRODUCT = 5;
const MAX_WIDTH = 1400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(url: string, attempts = 3): Promise<Buffer> {
  let lastError = "";
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(1200 * 2 ** (attempt - 1));
    try {
      const response = await fetch(url, {
        headers: sessionHeaders({ Accept: "image/avif,image/webp,image/*,*/*" }),
      });
      const type = response.headers.get("content-type") ?? "";
      // The origin mislabels some .avif uploads as text/plain, so we cannot
      // require an image/* type. Reject only the WAF's HTML challenge page and
      // let sharp be the real arbiter of whether the bytes decode.
      if (!response.ok || type.includes("text/html")) {
        lastError = `HTTP ${response.status} (${type || "no content-type"})`;
        continue;
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(`Could not download ${url}: ${lastError}`);
}

/**
 * Processes one image into a web-ready webp plus a blur placeholder.
 * Already-downloaded files are reused, so re-running ingest is cheap.
 */
async function processImage(
  remoteUrl: string,
  alt: string,
  slug: string,
  index: number,
): Promise<ProductImage> {
  const dir = path.join(OUTPUT_ROOT, slug);
  await mkdir(dir, { recursive: true });

  // Hash the source URL so a changed upstream image produces a new filename.
  const fingerprint = createHash("sha1").update(remoteUrl).digest("hex").slice(0, 8);
  const filename = `${index}-${fingerprint}.webp`;
  const absolute = path.join(dir, filename);

  let optimised: Buffer;
  try {
    optimised = await readFile(absolute);
  } catch {
    const original = await download(remoteUrl);
    optimised = await sharp(original)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    await writeFile(absolute, optimised);
  }

  const meta = await sharp(optimised).metadata();
  const blur = await sharp(optimised).resize(16).webp({ quality: 45 }).toBuffer();

  return {
    src: `/catalog/${slug}/${filename}`,
    width: meta.width ?? MAX_WIDTH,
    height: meta.height ?? MAX_WIDTH,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    alt: alt.trim() || "Product photograph",
  };
}

/**
 * Resolves a product's images, capped and de-duplicated. Individual failures
 * are logged and skipped rather than failing the whole run — a product with
 * one broken photo should still ship.
 */
export async function resolveProductImages(
  images: { src: string; alt: string }[],
  slug: string,
): Promise<ProductImage[]> {
  const unique = [...new Map(images.map((i) => [i.src, i])).values()].slice(
    0,
    MAX_IMAGES_PER_PRODUCT,
  );

  const resolved: ProductImage[] = [];
  for (const [index, image] of unique.entries()) {
    try {
      resolved.push(await processImage(image.src, image.alt, slug, index));
    } catch (error) {
      console.warn(`\n  ! ${slug} image ${index}: ${(error as Error).message}`);
    }
  }
  return resolved;
}
