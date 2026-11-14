import { createAction } from "@reduxjs/toolkit";

// Puts the shop back to its starter stores, products, accounts and empty
// carts. Every saved slice listens for it and rebuilds the seed from `now`.
const resetDemoData = createAction(
  "app/resetDemoData",
  (now: number = Date.now()) => ({ payload: { now } }),
);

export default resetDemoData;
