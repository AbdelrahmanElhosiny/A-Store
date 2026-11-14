import type { CategoryId } from "../../constant/categories";
import { ROUTES } from "../../constant/routes";

export type SearchScope = CategoryId | "all";

export const storeSearchPath = (q: string, scope: SearchScope): string | null => {
  const query = q.trim();
  if (!query) return scope === "all" ? null : ROUTES.category(scope);
  return ROUTES.search(query) + (scope === "all" ? "" : `&category=${scope}`);
};

export const sellerSearchPath = (q: string): string | null => {
  const query = q.trim();
  return query ? `${ROUTES.sellerOrders}?${new URLSearchParams({ q: query })}` : null;
};
