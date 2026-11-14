import * as yup from "yup";
import { CATEGORIES } from "../../constant/categories";
import { slugify } from "../../utils/slugify";

const sellerSignUpSchema = (isNameTaken: (name: string) => boolean, existingSlugs: string[]) =>
  yup.object({
    name: yup.string().trim().required("Enter your name")
      .min(2, "At least 2 characters")
      .max(24, "24 characters at most")
      .matches(/^[\p{L}\p{N} .'_-]+$/u, "Letters, numbers, spaces and . ' _ - only")
      .test("unique", "That name is taken, pick another", (value) => !value || !isNameTaken(value)),
    storeName: yup.string().trim().required("Enter a store name")
      .min(2, "At least 2 characters")
      .max(32, "32 characters at most")
      .test("unique", "That store name is taken", (value) => !value || !existingSlugs.includes(slugify(value))),
    categoryFocus: yup.string().required("Pick a category")
      .oneOf(CATEGORIES.map(({ id }) => id), "Pick a category"),
    tagline: yup.string().trim().max(60, "60 characters at most"),
  });

export default sellerSignUpSchema;
