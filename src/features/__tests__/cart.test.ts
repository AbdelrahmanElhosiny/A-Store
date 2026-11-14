import { describe, expect, it } from "vitest";
import { addToCart, lineKey, mergeCarts, setLineQuantity } from "../cart";
import { Item } from "../types";

const item = { id: "i1", stockNum: 3 } as Item;

describe("addToCart", () => {
  it("adds a new line at quantity 1", () =>
    expect(addToCart([], item)).toEqual([{ itemId: "i1", quantity: 1 }]));

  it("adds one more but not past the stock", () => {
    expect(addToCart([{ itemId: "i1", quantity: 2 }], item)).toEqual([
      { itemId: "i1", quantity: 3 },
    ]);
    expect(addToCart([{ itemId: "i1", quantity: 3 }], item)).toEqual([
      { itemId: "i1", quantity: 3 },
    ]);
  });

  it("keeps variants of one item on separate lines", () => {
    const cart = addToCart(
      [{ itemId: "i1", variantId: "v1", quantity: 1 }],
      {
        ...item,
        variants: [{ id: "v2", values: ["M"], price: 1, stockNum: 5, sku: "x" }],
      } as Item,
      "v2",
    );
    expect(cart).toHaveLength(2);
    expect(cart[1]).toEqual({ itemId: "i1", variantId: "v2", quantity: 1 });
  });

  it("caps a variant line at the variant's stock", () => {
    const withVariant = {
      ...item,
      stockNum: 9,
      variants: [{ id: "v1", values: ["S"], price: 1, stockNum: 1, sku: "x" }],
    } as Item;
    expect(
      addToCart([{ itemId: "i1", variantId: "v1", quantity: 1 }], withVariant, "v1"),
    ).toEqual([{ itemId: "i1", variantId: "v1", quantity: 1 }]);
  });

  it("doesn't add a sold-out item", () =>
    expect(addToCart([], { ...item, stockNum: 0 })).toEqual([]));
});

describe("setLineQuantity", () => {
  it("0 removes the line", () =>
    expect(setLineQuantity([{ itemId: "i1", quantity: 2 }], "i1", 0)).toEqual([]));

  it("sets an exact quantity, adding the line if needed", () => {
    expect(setLineQuantity([{ itemId: "i1", quantity: 2 }], "i1", 5)).toEqual([
      { itemId: "i1", quantity: 5 },
    ]);
    expect(setLineQuantity([], "i2", 2)).toEqual([{ itemId: "i2", quantity: 2 }]);
  });

  it("only touches the matching variant", () =>
    expect(
      setLineQuantity(
        [
          { itemId: "i1", variantId: "v1", quantity: 1 },
          { itemId: "i1", variantId: "v2", quantity: 1 },
        ],
        "i1",
        0,
        "v2",
      ),
    ).toEqual([{ itemId: "i1", variantId: "v1", quantity: 1 }]));
});

describe("mergeCarts", () => {
  it("caps at stock but keeps the account's own quantity", () => {
    expect(
      mergeCarts(
        [{ itemId: "a", quantity: 1 }],
        [
          { itemId: "a", quantity: 5 },
          { itemId: "b", quantity: 2 },
        ],
        { a: 3, b: 0 },
      ),
    ).toEqual([{ itemId: "a", quantity: 3 }]);
    expect(
      mergeCarts([{ itemId: "a", quantity: 4 }], [{ itemId: "a", quantity: 1 }], {
        a: 2,
      }),
    ).toEqual([{ itemId: "a", quantity: 4 }]);
  });

  it("reads a variant's stock by its line key", () =>
    expect(
      mergeCarts([], [{ itemId: "a", variantId: "v", quantity: 4 }], {
        a: 9,
        "a:v": 2,
      }),
    ).toEqual([{ itemId: "a", variantId: "v", quantity: 2 }]));
});

describe("lineKey", () => {
  it("is the item id, plus the variant id when there is one", () => {
    expect(lineKey({ itemId: "a" })).toBe("a");
    expect(lineKey({ itemId: "a", variantId: "v" })).toBe("a:v");
  });
});
