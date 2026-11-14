import { expect, it } from "vitest";
import { slugify } from "../slugify";

it.each([
  ["Tick & Tock!", "tick-tock"], ["  Carry Co. ", "carry-co"],
  ["Café 9", "caf-9"], ["", "store"], ["!!!", "store"],
])("slugifies %s", (name, expected) => expect(slugify(name)).toBe(expected));
