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
    description: "Lamps, mugs and kitchen pieces made to be used every day.",
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
  // how many days before "now" it was added
  daysAgo: number;
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
    daysAgo: 30,
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
    daysAgo: 29,
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
    daysAgo: 28,
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
    daysAgo: 27,
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
    daysAgo: 26,
  },
  {
    id: "item-tt-field-watch-38-mm",
    storeId: "store-tick-tock",
    category: "watches",
    name: "Field watch, 38 mm",
    description:
      "Automatic-look quartz field watch with a 38 mm steel case and a canvas strap.",
    price: 95,
    stockNum: 14,
    image: "field-watch-38-mm",
    sku: "T-002",
    daysAgo: 20,
  },
  {
    id: "item-tt-diver-watch-steel",
    storeId: "store-tick-tock",
    category: "watches",
    name: "Diver watch, steel",
    description:
      "Stainless steel case, rotating bezel and 200 m of water resistance.",
    price: 189,
    stockNum: 5,
    image: "diver-watch-steel",
    sku: "T-003",
    daysAgo: 45,
  },
  {
    id: "item-tt-minimal-quartz-watch",
    storeId: "store-tick-tock",
    category: "watches",
    name: "Minimal quartz watch",
    description:
      "Slim 36 mm case with a plain dial and a leather strap, quartz movement.",
    price: 59,
    stockNum: 22,
    image: "minimal-quartz-watch",
    sku: "T-004",
    daysAgo: 12,
  },
  {
    id: "item-tt-chronograph-leather-strap",
    storeId: "store-tick-tock",
    category: "watches",
    name: "Chronograph, leather strap",
    description: "Three sub-dials, 42 mm steel case and a tan leather strap.",
    price: 159,
    stockNum: 0,
    image: "chronograph-leather-strap",
    sku: "T-005",
    daysAgo: 58,
  },
  {
    id: "item-tt-kids-digital-watch",
    storeId: "store-tick-tock",
    category: "watches",
    name: "Kids' digital watch",
    description:
      "Digital display with backlight, alarm and a soft resin strap, 50 m water resistant.",
    price: 24,
    stockNum: 30,
    image: "kids-digital-watch",
    sku: "T-006",
    daysAgo: 7,
  },
  {
    id: "item-tt-leather-watch-strap-20-mm",
    storeId: "store-tick-tock",
    category: "accessories",
    name: "Leather watch strap, 20 mm",
    description:
      "Full-grain leather with a stainless buckle and quick-release spring bars.",
    price: 19,
    stockNum: 40,
    image: "leather-watch-strap-20-mm",
    sku: "T-007",
    daysAgo: 33,
  },
  {
    id: "item-tt-watch-winder-box",
    storeId: "store-tick-tock",
    category: "accessories",
    name: "Watch winder box",
    description:
      "Single-watch winder in a wood-effect box with a quiet motor and USB power.",
    price: 49,
    stockNum: 3,
    image: "watch-winder-box",
    sku: "T-008",
    daysAgo: 52,
  },
  {
    id: "item-cc-canvas-tote",
    storeId: "store-carry-co",
    category: "bags",
    name: "Canvas tote",
    description:
      "Heavy cotton canvas, 12 L, with a reinforced handle and an inner pocket.",
    price: 29,
    stockNum: 25,
    image: "canvas-tote",
    sku: "C-002",
    daysAgo: 17,
  },
  {
    id: "item-cc-leather-wallet",
    storeId: "store-carry-co",
    category: "accessories",
    name: "Leather wallet",
    description:
      "Bifold in vegetable-tanned leather with six card slots and a coin pocket.",
    price: 35,
    stockNum: 18,
    image: "leather-wallet",
    sku: "C-003",
    daysAgo: 40,
  },
  {
    id: "item-cc-weekender-duffel",
    storeId: "store-carry-co",
    category: "bags",
    name: "Weekender duffel",
    description:
      "45 L waxed canvas with a shoulder strap and a separate shoe compartment.",
    price: 119,
    stockNum: 4,
    image: "weekender-duffel",
    sku: "C-004",
    daysAgo: 9,
  },
  {
    id: "item-cc-laptop-sleeve-14-inch",
    storeId: "store-carry-co",
    category: "bags",
    name: "Laptop sleeve, 14 inch",
    description:
      "Padded leather-look sleeve with a soft lining and a zip all round.",
    price: 32,
    stockNum: 0,
    image: "laptop-sleeve-14-inch",
    sku: "C-005",
    daysAgo: 55,
  },
  {
    id: "item-cc-crossbody-sling",
    storeId: "store-carry-co",
    category: "bags",
    name: "Crossbody sling",
    description:
      "Water-resistant 4 L sling with an adjustable strap and a hidden zip pocket.",
    price: 39,
    stockNum: 12,
    image: "crossbody-sling",
    sku: "C-006",
    daysAgo: 24,
  },
  {
    id: "item-cc-card-holder",
    storeId: "store-carry-co",
    category: "accessories",
    name: "Card holder",
    description: "Slim leather holder for up to four cards, 2 mm thick.",
    price: 15,
    stockNum: 50,
    image: "card-holder",
    sku: "C-007",
    daysAgo: 3,
  },
  {
    id: "item-cc-hiking-daypack-28-l",
    storeId: "store-carry-co",
    category: "bags",
    name: "Hiking daypack, 28 L",
    description: "Ventilated back panel, hip belt and a rain cover, 780 g.",
    price: 85,
    stockNum: 2,
    image: "hiking-daypack-28-l",
    sku: "C-008",
    daysAgo: 48,
  },
  {
    id: "item-ps-budget-smartphone-128-gb",
    storeId: "store-pocket-signal",
    category: "phones",
    name: "Budget smartphone, 128 GB",
    description:
      "6.5-inch display, 128 GB storage, dual SIM and a 5,000 mAh battery.",
    price: 199,
    stockNum: 9,
    image: "budget-smartphone-128-gb",
    sku: "P-002",
    daysAgo: 14,
  },
  {
    id: "item-ps-flagship-smartphone-256-gb",
    storeId: "store-pocket-signal",
    category: "phones",
    name: "Flagship smartphone, 256 GB",
    description: "6.7-inch OLED, 256 GB storage, triple camera and 5G.",
    price: 749,
    stockNum: 3,
    image: "flagship-smartphone-256-gb",
    sku: "P-003",
    daysAgo: 36,
  },
  {
    id: "item-ps-wireless-earbuds",
    storeId: "store-pocket-signal",
    category: "audio",
    name: "Wireless earbuds",
    description: "Bluetooth 5.3, 6 hours per charge and 24 with the case.",
    price: 59,
    stockNum: 20,
    image: "wireless-earbuds",
    sku: "P-004",
    daysAgo: 5,
  },
  {
    id: "item-ps-clear-phone-case",
    storeId: "store-pocket-signal",
    category: "accessories",
    name: "Clear phone case",
    description:
      "Scratch-resistant clear shell with raised edges and a magnetic ring.",
    price: 12,
    stockNum: 60,
    image: "clear-phone-case",
    sku: "P-005",
    daysAgo: 29,
  },
  {
    id: "item-ps-65-w-usb-c-charger",
    storeId: "store-pocket-signal",
    category: "accessories",
    name: "65 W USB-C charger",
    description:
      "Two USB-C ports and one USB-A, folding plug, charges a laptop and a phone together.",
    price: 29,
    stockNum: 0,
    image: "65-w-usb-c-charger",
    sku: "P-006",
    daysAgo: 60,
  },
  {
    id: "item-ps-power-bank-10-000-mah",
    storeId: "store-pocket-signal",
    category: "accessories",
    name: "Power bank, 10,000 mAh",
    description:
      "USB-C in and out with 22.5 W output, and a three-light charge display.",
    price: 34,
    stockNum: 15,
    image: "power-bank-10-000-mah",
    sku: "P-007",
    daysAgo: 22,
  },
  {
    id: "item-ps-bluetooth-speaker",
    storeId: "store-pocket-signal",
    category: "audio",
    name: "Bluetooth speaker",
    description: "Pocket-size, 12 hours of playback and IPX7 water resistance.",
    price: 49,
    stockNum: 2,
    image: "bluetooth-speaker",
    sku: "P-008",
    daysAgo: 11,
  },
  {
    id: "item-hl-pour-over-coffee-set",
    storeId: "store-hearth-lane",
    category: "home-kitchen",
    name: "Pour-over coffee set",
    description:
      "Glass server, ceramic dripper and 100 paper filters, makes two cups.",
    price: 38,
    stockNum: 7,
    image: "pour-over-coffee-set",
    sku: "H-003",
    daysAgo: 42,
  },
  {
    id: "item-hl-linen-throw-blanket",
    storeId: "store-hearth-lane",
    category: "home-kitchen",
    name: "Linen throw blanket",
    description: "Washed linen, 130 by 170 cm, with a fringed edge.",
    price: 55,
    stockNum: 0,
    image: "linen-throw-blanket",
    sku: "H-004",
    daysAgo: 50,
  },
  {
    id: "item-hl-cast-iron-skillet-26-cm",
    storeId: "store-hearth-lane",
    category: "home-kitchen",
    name: "Cast iron skillet, 26 cm",
    description:
      "Pre-seasoned cast iron with a helper handle, oven safe to 260 C.",
    price: 42,
    stockNum: 11,
    image: "cast-iron-skillet-26-cm",
    sku: "H-005",
    daysAgo: 8,
  },
  {
    id: "item-hl-scented-candle",
    storeId: "store-hearth-lane",
    category: "home-kitchen",
    name: "Scented candle",
    description: "Soy wax in an amber glass jar, 40 hours of burn time.",
    price: 18,
    stockNum: 2,
    image: "scented-candle",
    sku: "H-006",
    daysAgo: 18,
  },
];

// -----------------
// Buyers
// -----------------
export interface SeedCard {
  brand: "visa" | "mastercard";
  last4: string;
  // the card expires this many months after "now", so it never ages out
  monthsAhead: number;
  holder?: string;
  nickname?: string;
}

export interface SeedBuyer {
  id: string;
  name: string;
  avatarColor: string;
  // the first address is their default
  addresses: {
    label: string;
    line1: string;
    city: string;
    zipCode: string;
    phoneNum: string;
  }[];
  cards: SeedCard[]; // the first card is the default, if any
  // cash on delivery is the default when there are no cards to prefer
  codIsDefault: boolean;
}

export const SEED_BUYERS: SeedBuyer[] = [
  {
    id: "acc-ahmed",
    name: "Ahmed",
    avatarColor: color.red,
    addresses: [
      {
        label: "Home",
        line1: "14 Nile Street",
        city: "Cairo",
        zipCode: "11511",
        phoneNum: "+20 100 000 0001",
      },
      {
        label: "Work",
        line1: "Smart Village, Building B2",
        city: "Giza",
        zipCode: "12577",
        phoneNum: "+20 100 000 0001",
      },
    ],
    cards: [
      { brand: "visa", last4: "4242", monthsAhead: 25, holder: "Ahmed Hassan" },
    ],
    codIsDefault: false,
  },
  {
    id: "acc-omar",
    name: "Omar",
    avatarColor: color.sell,
    addresses: [
      {
        label: "Home",
        line1: "8 Corniche Road",
        city: "Alexandria",
        zipCode: "21500",
        phoneNum: "+20 100 000 0002",
      },
      {
        label: "Parents",
        line1: "22 Fouad Street",
        city: "Alexandria",
        zipCode: "21511",
        phoneNum: "+20 100 000 0012",
      },
    ],
    cards: [
      {
        brand: "mastercard",
        last4: "4444",
        monthsAhead: 9,
        holder: "Omar Khaled",
      },
    ],
    codIsDefault: true,
  },
  {
    id: "acc-nour",
    name: "Nour",
    avatarColor: color.yellow,
    addresses: [
      {
        label: "Home",
        line1: "5 Pyramids Road",
        city: "Giza",
        zipCode: "12556",
        phoneNum: "+20 100 000 0003",
      },
      {
        label: "Work",
        line1: "30 Talaat Harb Street",
        city: "Cairo",
        zipCode: "11121",
        phoneNum: "+20 100 000 0003",
      },
    ],
    cards: [
      { brand: "visa", last4: "4242", monthsAhead: 28, holder: "Nour Adel" },
      {
        brand: "mastercard",
        last4: "4444",
        monthsAhead: 6,
        nickname: "Work card",
      },
    ],
    codIsDefault: false,
  },
];
