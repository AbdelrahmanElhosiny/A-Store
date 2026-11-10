import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { Item } from "./itemSlice";

interface User {
  userName: string;
  address: string;
  optAddress?: string;
  zipCode: number;
  phoneNum: number;
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

const initialState: User[] = [
  {
    userName: "Guest",
    address: "",
    optAddress: "",
    zipCode: 0,
    phoneNum: 0,
    isLoggedIn: true,
    userType: "buyer",
    cart: [],
    orderedItems: [],
    pillingInfo: [],
  },
  {
    userName: "Ahmed",
    address: "abc street",
    optAddress: "",
    zipCode: 123,
    phoneNum: 123,
    isLoggedIn: false,
    userType: "buyer",
    cart: [],
    orderedItems: [],
    pillingInfo: [],
  },
  {
    userName: "Omar",
    address: "abc street",
    optAddress: "",
    zipCode: 123,
    phoneNum: 123,
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

    // setLoggedInUser
    setLoggedInUser: (state, action: PayloadAction<string>) => {
      const userIndex = _.findIndex(state, { userName: action.payload });
      state[userIndex].isLoggedIn = true;
      state[0].isLoggedIn = false;
      //TODO: when logged in transfer data from guest to user
    },

    // setLoggedOutUser
    setLoggedOutUser: (state, action: PayloadAction<string>) => {
      const userIndex = _.findIndex(state, { userName: action.payload });
      state[0].isLoggedIn = true;
      state[userIndex].isLoggedIn = false;
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
});

export type { User, OrderedItemStatus, CartItemStatus };
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
