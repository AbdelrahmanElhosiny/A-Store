import { CategoryId } from "../constant/categories";
import { color } from "../styles/tokens";
import { SeedImageName } from "./images";

// The starter world as plain data: stores with their sellers, products and
// buyers. buildSeed.ts turns it into accounts, stores and items, with every
// time counted back from "now". Add to these lists to grow the seed.

// -----------------
// Stores and their sellers
// -----------------
export interface SeedStore {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logoLetter: string;
  logoColor: string;
  categoryFocus: CategoryId;
  sinceDaysAgo: number;
  owner: { id: string; name: string; avatarColor: string };
}

export const SEED_STORES: SeedStore[] = [
  {
    id: "store-tick-tock",
    slug: "tick-tock",
    name: "Tick & Tock",
    tagline: "Watches that keep up with you.",
    description:
      "Smart and classic watches, picked for battery life and comfort on the wrist.",
    logoLetter: "T",
    logoColor: color.yellow,
    categoryFocus: "watches",
    sinceDaysAgo: 400,
    owner: { id: "acc-mona", name: "Mona", avatarColor: color.yellow },
  },
  {
    id: "store-carry-co",
    slug: "carry-co",
    name: "Carry Co.",
    tagline: "Bags for the commute and the weekend.",
    description:
      "Backpacks and bags that survive the rain, the metro and a full laptop.",
    logoLetter: "C",
    // Gruvbox aqua isn't a token; green is the nearest one
    logoColor: color.green,
    categoryFocus: "bags",
    sinceDaysAgo: 300,
    owner: { id: "acc-karim", name: "Karim", avatarColor: color.green },
  },
  {
    id: "store-pocket-signal",
    slug: "pocket-signal",
    name: "Pocket Signal",
    tagline: "Phones, sound and the gear around them.",
    description:
      "Phones and audio gear, tested at the counter before they go on the shelf.",
    logoLetter: "P",
    // Gruvbox blue is only a token as the buy colour
    logoColor: color.buy,
    categoryFocus: "phones",
    sinceDaysAgo: 200,
    owner: { id: "acc-youssef", name: "Youssef", avatarColor: color.buy },
  },
  {
    id: "store-hearth-lane",
    slug: "hearth-lane",
    name: "Hearth Lane",
    tagline: "Small things that make a home.",
    description:
      "Lamps, mugs and kitchen pieces made to be used every day.",
    logoLetter: "H",
    logoColor: color.orange,
    categoryFocus: "home-kitchen",
    sinceDaysAgo: 120,
    owner: { id: "acc-laila", name: "Laila", avatarColor: color.orange },
  },
];

// -----------------
// Products
// -----------------
// in the order the shop lists them
export interface SeedItem {
  id: string;
  storeId: string;
  category: CategoryId;
  name: string;
  description: string;
  price: number;
  stockNum: number;
  image: SeedImageName;
  sku: string;
}

export const SEED_ITEMS: SeedItem[] = [
  {
    id: "item-ps-headphones",
    storeId: "store-pocket-signal",
    category: "audio",
    name: "Wireless headphones",
    description: "Over-ear, 30 hours of battery, folds flat into its case.",
    price: 89,
    stockNum: 12,
    image: "headphones",
    sku: "P-001",
  },
  {
    id: "item-hl-desk-lamp",
    storeId: "store-hearth-lane",
    category: "home-kitchen",
    name: "Desk lamp",
    description: "Steel shade on an adjustable arm, warm white bulb included.",
    price: 45,
    stockNum: 3,
    image: "lamp",
    sku: "H-001",
  },
  {
    id: "item-hl-ceramic-mug",
    storeId: "store-hearth-lane",
    category: "home-kitchen",
    name: "Ceramic mug",
    description: "350 ml stoneware, dishwasher safe, matte white glaze.",
    price: 14,
    stockNum: 40,
    image: "mug",
    sku: "H-002",
  },
  {
    id: "item-tt-smart-watch",
    storeId: "store-tick-tock",
    category: "watches",
    name: "Smart watch",
    description: "Heart rate, sleep tracking and a week of battery life.",
    price: 129,
    stockNum: 2,
    image: "watch",
    sku: "T-001",
  },
  {
    id: "item-cc-city-backpack",
    storeId: "store-carry-co",
    category: "bags",
    name: "City backpack",
    description: "20 L, water-resistant, padded sleeve for a 15-inch laptop.",
    price: 65,
    stockNum: 8,
    image: "backpack",
    sku: "C-001",
  },
];

// -----------------
// Buyers
// -----------------
export interface SeedBuyer {
  id: string;
  name: string;
  avatarColor: string;
  // the first address is their default
  addresses: { line1: string; city: string; zipCode: string; phoneNum: string }[];
}

export const SEED_BUYERS: SeedBuyer[] = [
  {
    id: "acc-ahmed",
    name: "Ahmed",
    avatarColor: color.red,
    addresses: [
      {
        line1: "14 Nile Street",
        city: "Cairo",
        zipCode: "11511",
        phoneNum: "+20 100 000 0001",
      },
    ],
  },
  {
    id: "acc-omar",
    name: "Omar",
    avatarColor: color.sell,
    addresses: [
      {
        line1: "8 Corniche Road",
        city: "Alexandria",
        zipCode: "21500",
        phoneNum: "+20 100 000 0002",
      },
    ],
  },
];
