export const NAV_ROW = { bar: 56, categories: 40, search: 56 } as const;

export const navHeight = (side: "buy" | "sell", isPhone: boolean): number =>
  NAV_ROW.bar + (side === "sell" ? 0 : isPhone ? NAV_ROW.search : NAV_ROW.categories);
