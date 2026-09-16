/**
 * Curated navigation taxonomy.
 *
 * The source WooCommerce store has 60 categories across 16 top-level roots
 * with heavy duplication (`camping-stoves` vs `camping > gas-cooking-stove`,
 * `clothes` vs `apparel`, a misspelled `hiking-accesories`). Rather than
 * mirror that, the storefront presents seven curated categories and maps the
 * source slugs onto them. The messy source taxonomy stays an ingest detail.
 */

export type CuratedSubcategory = {
  id: string;
  name: string;
  /** Source WooCommerce category slugs that feed this subcategory. */
  wooSlugs: string[];
};

export type CuratedCategory = {
  id: string;
  name: string;
  /** Short editorial intro, shown under the category heading. */
  blurb: string;
  wooSlugs: string[];
  subcategories: CuratedSubcategory[];
};

export const CURATED_CATEGORIES: CuratedCategory[] = [
  {
    id: "tents-shelter",
    name: "Tents & Shelter",
    blurb: "Dome tents and shelters built for wind, rain and altitude.",
    wooSlugs: ["camping-tent"],
    subcategories: [],
  },
  {
    id: "sleeping",
    name: "Sleeping",
    blurb: "Bags, mats and cots — the difference between a night and a long night.",
    wooSlugs: ["sleeping-bag-camping", "portable-bed-cots"],
    subcategories: [
      { id: "sleeping-bags", name: "Sleeping Bags", wooSlugs: ["sleeping-bag-camping"] },
      { id: "beds-mats", name: "Beds & Mattresses", wooSlugs: ["portable-bed-cots"] },
    ],
  },
  {
    id: "cooking",
    name: "Cooking",
    blurb: "Stoves, fuel and cook sets for camp kitchens of every size.",
    wooSlugs: [
      "gas-cooking-stove",
      "biomass-stoves",
      "camping-stoves",
      "camping-cook-set-utensils",
      "camping-cookware",
      "camping-kitchen-gear",
    ],
    subcategories: [
      {
        id: "stoves",
        name: "Stoves",
        wooSlugs: ["gas-cooking-stove", "biomass-stoves", "camping-stoves"],
      },
      {
        id: "cook-sets",
        name: "Cook Sets & Cookware",
        wooSlugs: ["camping-cook-set-utensils", "camping-cookware", "camping-kitchen-gear"],
      },
    ],
  },
  {
    id: "packs",
    name: "Backpacks & Bags",
    blurb: "Rucksacks, daypacks and dry bags, from summit pushes to long carries.",
    wooSlugs: [
      "backpack",
      "travel-backpack",
      "travel-backpack-camping",
      "organizer-bag",
      "water-bag",
    ],
    subcategories: [
      {
        id: "rucksacks",
        name: "Rucksacks",
        wooSlugs: ["backpack", "travel-backpack", "travel-backpack-camping"],
      },
      { id: "bags", name: "Bags & Organisers", wooSlugs: ["organizer-bag", "water-bag"] },
    ],
  },
  {
    id: "apparel-footwear",
    name: "Apparel & Footwear",
    blurb: "Layers and boots that hold up on the trail and look right off it.",
    wooSlugs: [
      "apparel",
      "men",
      "shirts",
      "trekking-pants",
      "windcheater",
      "jackets",
      "socks-accessories",
      "clothes",
      "footwear",
      "footwear-camping",
    ],
    subcategories: [
      { id: "jackets-shells", name: "Jackets & Windcheaters", wooSlugs: ["jackets", "windcheater"] },
      { id: "clothing", name: "Shirts & Trousers", wooSlugs: ["shirts", "trekking-pants", "clothes"] },
      { id: "footwear", name: "Footwear", wooSlugs: ["footwear", "footwear-camping"] },
      { id: "socks", name: "Socks", wooSlugs: ["socks-accessories"] },
    ],
  },
  {
    id: "furniture",
    name: "Furniture",
    blurb: "Chairs, tables and stools that fold down small and sit steady.",
    wooSlugs: ["furniture", "chair", "stool", "table"],
    subcategories: [
      { id: "chairs", name: "Chairs & Stools", wooSlugs: ["chair", "stool"] },
      { id: "tables", name: "Tables", wooSlugs: ["table"] },
    ],
  },
  {
    id: "lights-accessories",
    name: "Lights & Accessories",
    blurb: "Headlamps, poles, eyewear and the small things you notice when missing.",
    wooSlugs: [
      "lights-and-headlamp",
      "headlamp",
      "lights",
      "camping-accessories",
      "uv-sunglasses",
      "safety-equipment",
      "hiking",
      "trekking-pole",
      "hiking-accesories",
      "camping-hiking",
    ],
    subcategories: [
      { id: "lights", name: "Lights & Headlamps", wooSlugs: ["lights-and-headlamp", "headlamp", "lights"] },
      { id: "poles", name: "Trekking Poles", wooSlugs: ["trekking-pole", "hiking", "hiking-accesories"] },
      { id: "eyewear", name: "Sunglasses", wooSlugs: ["uv-sunglasses"] },
      {
        id: "accessories",
        name: "Accessories",
        wooSlugs: ["camping-accessories", "safety-equipment", "camping-hiking"],
      },
    ],
  },
];

/** Products whose source categories match none of the curated slugs land here. */
export const FALLBACK_CATEGORY: CuratedCategory = {
  id: "more-gear",
  name: "More Gear",
  blurb: "Everything else worth carrying.",
  wooSlugs: [],
  subcategories: [],
};

/** The source category tree under which rental stock lives. */
export const RENTAL_ROOT_SLUG = "rental";

/** Lookup: source Woo slug -> curated category id. Built once at module load. */
const WOO_SLUG_TO_CATEGORY = new Map<string, string>();
for (const category of CURATED_CATEGORIES) {
  for (const slug of category.wooSlugs) {
    // First declaration wins, so ordering above defines precedence.
    if (!WOO_SLUG_TO_CATEGORY.has(slug)) WOO_SLUG_TO_CATEGORY.set(slug, category.id);
  }
}

/**
 * Maps a product's source category slugs onto curated category ids.
 * Returns the fallback category when nothing matches, so no product is lost.
 */
export function toCuratedCategoryIds(wooSlugs: string[]): string[] {
  const ids = new Set<string>();
  for (const slug of wooSlugs) {
    const id = WOO_SLUG_TO_CATEGORY.get(slug);
    if (id) ids.add(id);
  }
  return ids.size > 0 ? [...ids] : [FALLBACK_CATEGORY.id];
}

export function getCategory(id: string): CuratedCategory | undefined {
  if (id === FALLBACK_CATEGORY.id) return FALLBACK_CATEGORY;
  return CURATED_CATEGORIES.find((c) => c.id === id);
}

export function getSubcategory(
  categoryId: string,
  subId: string,
): CuratedSubcategory | undefined {
  return getCategory(categoryId)?.subcategories.find((s) => s.id === subId);
}
