import type { SearchEntry } from "./queries";

/**
 * Matches a free-text query against the search index.
 *
 * Shared by the header overlay and the /search page so both rank identically.
 * The index holds names and categories only — not descriptions — which keeps
 * it a few KB and keeps results predictable.
 */
export function searchProducts(
  index: SearchEntry[],
  query: string,
  limit = 40,
): SearchEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return index
    .map((entry) => {
      const name = entry.name.toLowerCase();
      const haystack = `${name} ${entry.category.toLowerCase()}`;
      if (!terms.every((term) => haystack.includes(term))) return null;

      // Rank: name starts with the query, then name contains it, then category.
      const first = terms[0];
      const score = name.startsWith(first) ? 0 : name.includes(first) ? 1 : 2;
      return { entry, score };
    })
    .filter((hit): hit is { entry: SearchEntry; score: number } => hit !== null)
    .sort((a, b) => a.score - b.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map((hit) => hit.entry);
}

export function productHref(entry: SearchEntry): string {
  return entry.rental ? `/rent/${entry.slug}` : `/p/${entry.slug}`;
}
