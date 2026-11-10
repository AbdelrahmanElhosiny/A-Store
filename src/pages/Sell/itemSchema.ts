import * as yup from "yup";

// "" counts as empty, so "required" shows instead of "not a number"
const emptyToUndefined = (value: unknown, original: unknown) =>
  original === "" ? undefined : value;

// The same checks for adding and updating. A new item needs at least one unit;
// an existing one can go down to 0 to show it as sold out.
const getItemSchema = (minStock: 0 | 1) =>
  yup.object({
    name: yup
      .string()
      .trim()
      .required("Enter a name")
      .max(60, "60 characters at most"),
    description: yup
      .string()
      .trim()
      .required("Enter a description")
      .max(300, "300 characters at most"),
    price: yup
      .number()
      .transform(emptyToUndefined)
      .typeError("Enter a number, like 12.50")
      .required("Enter a price")
      .moreThan(0, "The price must be more than $0")
      .max(99999, "At most $99,999")
      .test(
        "cents",
        "At most 2 decimals",
        (value) =>
          value === undefined || Number.isInteger(+(value * 100).toFixed(6)),
      ),
    stockNum: yup
      .number()
      .transform(emptyToUndefined)
      .typeError("Enter a whole number")
      .required("Enter how many are in stock")
      .integer("Enter a whole number")
      .min(
        minStock,
        minStock === 1 ? "At least 1 to start selling" : "Can't be below 0",
      )
      .max(9999, "At most 9,999"),
  });

export default getItemSchema;
