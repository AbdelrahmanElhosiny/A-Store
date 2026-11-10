import { createAction } from "@reduxjs/toolkit";

// Puts the shop back to its starter items, accounts and empty carts.
// Both the items and the users slices listen for it.
const resetDemoData = createAction("app/resetDemoData");

export default resetDemoData;
