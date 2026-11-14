import headphones from "../assets/products/headphones.webp";
import lamp from "../assets/products/lamp.webp";
import mug from "../assets/products/mug.webp";
import watch from "../assets/products/watch.webp";
import backpack from "../assets/products/backpack.webp";

// Bundled product pictures by name, from Unsplash (see
// src/assets/products/CREDITS.md). Saved data refers to them by name, since
// the URLs change with every build (see app/persist.ts).
export const SEED_IMAGES = {
  headphones,
  lamp,
  mug,
  watch,
  backpack,
} as const satisfies Record<string, string>;

export type SeedImageName = keyof typeof SEED_IMAGES;
