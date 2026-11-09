const options = { style: "currency", currency: "USD" } as const;
const whole = new Intl.NumberFormat("en-US", {
  ...options,
  maximumFractionDigits: 0,
});
const withCents = new Intl.NumberFormat("en-US", options);

// 89 -> "$89", 12.5 -> "$12.50"
const formatPrice = (price: number) =>
  (Number.isInteger(price) ? whole : withCents).format(price);

export default formatPrice;
