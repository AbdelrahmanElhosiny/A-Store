// The shop's categories. Every item belongs to one; every store has one as
// its focus. The ids end up in addresses (/c/watches) and saved data.
export const CATEGORIES = [
  { id: "watches", label: "Watches" },
  { id: "bags", label: "Bags" },
  { id: "phones", label: "Phones" },
  { id: "audio", label: "Audio" },
  { id: "home-kitchen", label: "Home and kitchen" },
  { id: "accessories", label: "Accessories" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const categoryLabel = (id: CategoryId): string =>
  CATEGORIES.find((category) => category.id === id)?.label ?? id;
