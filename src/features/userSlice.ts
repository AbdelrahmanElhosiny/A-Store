import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { Item, removeItem } from "./itemSlice";
import resetDemoData from "../app/resetDemoData";

interface User {
  userName: string;
  address: string;
  optAddress?: string;
  // strings: a number would drop leading zeros and "+"
  zipCode: string;
  phoneNum: string;
  isLoggedIn: boolean;
  userType: "seller" | "buyer";
  cart: CartItemStatus[];
  orderedItems: OrderedItemStatus[];
  pillingInfo: PillingInfo[];
}
//TODO: make seller (sold and other things) and buyer (cart and ordered items and pilling info) with ?
//TODO: Tracking sold items to itemSlice
//TODO: make user one obj with two baths seller and buyer then fill them with info

interface CartItemStatus {
  itemId: string;
  inCartNum: number;
}
// one line of an order; every line placed together shares the orderId
interface OrderedItemStatus {
  orderId: string;
  itemId: string;
  orderedNum: number;
  orderedAt: number; // ms timestamp; the delivery status is worked out from it
  // the item as it was when ordered: the seller can change or remove it later
  name: string;
  price: number;
  image?: string;
}
interface PillingInfo {
  cardNum: number;
  cvv: number;
  expireDate: number;
}
// the stock of each item, so a merged cart never asks for more than exists
interface LogInPayload {
  userName: string;
  stockById: Record<string, number>;
}

// the guest is always first; it is the active user when nobody is logged in
const GUEST_NAME = "Guest";

const initialState: User[] = [
  {
    userName: GUEST_NAME,
    address: "",
    optAddress: "",
    zipCode: "",
    phoneNum: "",
    isLoggedIn: true,
    userType: "buyer",
    cart: [],
    orderedItems: [],
    pillingInfo: [],
  },
  {
    userName: "Ahmed",
    address: "14 Nile Street, Cairo",
    optAddress: "",
    zipCode: "11511",
    phoneNum: "+20 100 000 0001",
    isLoggedIn: false,
    userType: "buyer",
    cart: [],
    orderedItems: [],
    pillingInfo: [],
  },
  {
    userName: "Omar",
    address: "8 Corniche Road, Alexandria",
    optAddress: "",
    zipCode: "21500",
    phoneNum: "+20 100 000 0002",
    isLoggedIn: false,
    userType: "buyer",
    cart: [],
    orderedItems: [],
    pillingInfo: [],
  },
];

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // addNewUSer
    addNewUser: (state, action: PayloadAction<User>) => {
      state.push(action.payload);
    },

    // setLoggedInUser: what the guest had in the cart and ordered moves to
    // the account, so nothing is lost by logging in halfway through shopping
    setLoggedInUser: (state, action: PayloadAction<LogInPayload>) => {
      const { userName, stockById } = action.payload;
      const user = state.find((u) => u.userName === userName);
      const guest = state[0];
      if (!user || user === guest || user.isLoggedIn) return;

      if (guest.isLoggedIn) {
        guest.cart.forEach(({ itemId, inCartNum }) => {
          const line = user.cart.find((cartItem) => cartItem.itemId === itemId);
          const hadNum = line?.inCartNum ?? 0;
          // add them up, but not past the stock (and never below what the
          // account already had)
          const mergedNum = Math.max(
            Math.min(hadNum + inCartNum, stockById[itemId] ?? 0),
            hadNum,
          );
          if (line) line.inCartNum = mergedNum;
          else if (mergedNum > 0) user.cart.push({ itemId, inCartNum: mergedNum });
        });
        user.orderedItems.push(...guest.orderedItems);
        guest.cart = [];
        guest.orderedItems = [];
      }

      state.forEach((u) => (u.isLoggedIn = false));
      user.isLoggedIn = true;
    },

    // setLoggedOutUser: back to the guest, with an empty cart
    setLoggedOutUser: (state) => {
      state.forEach((u) => (u.isLoggedIn = false));
      state[0].isLoggedIn = true;
    },

    // addItemToCart
    addItemToUserCart: (state, action: PayloadAction<Item>) => {
      const activeUser = _.findIndex(state, { isLoggedIn: true });
      const items = state[activeUser].cart;
      const isItemAddedToCartBefore = _.includes(
        _.map(items, "itemId"),
        action.payload.id
      );
      const itemIndex = items.findIndex(
        ({ itemId }) => itemId === action.payload.id
      );

      if (
        isItemAddedToCartBefore &&
        action.payload.stockNum > items[itemIndex].inCartNum
      ) {
        items[itemIndex].inCartNum++;
        return;
      } else if (isItemAddedToCartBefore) {
        return state;
      } else items.push({ itemId: action.payload.id, inCartNum: 1 });
    },

    // setCartItemNum: an exact quantity from the card's stepper; 0 removes it
    setCartItemNum: (state, action: PayloadAction<CartItemStatus>) => {
      const activeUser = _.findIndex(state, { isLoggedIn: true });
      const items = state[activeUser].cart;
      const { itemId, inCartNum } = action.payload;
      const cartItem = items.find((item) => item.itemId === itemId);

      if (inCartNum <= 0) _.remove(items, { itemId });
      else if (cartItem) cartItem.inCartNum = inCartNum;
      else items.push({ itemId, inCartNum });
    },

    //removeItemFromCart
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const activeUser = _.findIndex(state, { isLoggedIn: true });
      const items = state[activeUser].cart;
      _.remove(items, { itemId: action.payload });
    },

    // placeOrder: adds the order's lines and takes them out of the cart
    placeOrder: (state, action: PayloadAction<OrderedItemStatus[]>) => {
      const activeUser = state[_.findIndex(state, { isLoggedIn: true })];
      const orderedIds = action.payload.map(({ itemId }) => itemId);
      activeUser.orderedItems.push(...action.payload);
      _.remove(activeUser.cart, ({ itemId }) => orderedIds.includes(itemId));
    },
    // delivery (4)
  },
  extraReducers: (builder) => {
    builder.addCase(resetDemoData, () => initialState);
    // a removed item leaves every cart (orders keep their own copy)
    builder.addCase(removeItem, (state, action) => {
      state.forEach(({ cart }) => _.remove(cart, { itemId: action.payload }));
    });
  },
});

export type { User, OrderedItemStatus, CartItemStatus };
export { GUEST_NAME };
export const {
  addNewUser,
  setLoggedInUser,
  setLoggedOutUser,
  addItemToUserCart,
  setCartItemNum,
  removeItemFromCart,
  placeOrder,
} = userSlice.actions;
export default userSlice.reducer;
