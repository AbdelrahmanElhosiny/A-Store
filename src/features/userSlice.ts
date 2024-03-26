import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { Item } from "./itemSlice";
import { v4 as uuid } from "uuid";

interface User {
  userName: string;
  address: string;
  optAddress?: string;
  zipCode: number;
  phoneNum: number;
  isActive: boolean;
  cart: CartItemStatus[];
  orderedItems: OrderedItemStatus[];
  pillingInfo: PillingInfo[];
}
interface CartItemStatus {
  itemId: string;
  inCartNum: number;
}
interface OrderedItemStatus {
  orderId: string;
  itemId: string;
  orderedNum: number;
  isInDelivery?: boolean;
  isDelivered?: boolean;
}
interface PillingInfo {
  cardNum: number;
  cvv: number;
  expireDate: number;
}

const initialState: User[] = [
  {
    userName: "Mohammed Ali",
    address: "abc street",
    optAddress: "",
    zipCode: 123,
    phoneNum: 123,
    isActive: true,
    cart: [],
    orderedItems: [],
    pillingInfo: [],
  },
  {
    userName: "Ali Ahmed",
    address: "abc street",
    optAddress: "",
    zipCode: 123,
    phoneNum: 123,
    isActive: false,
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
    // removeUser
    // setActiveUser
    setActiveUser: (state) => {
      _.map(state, { isActive: false });
    },
    // addItemToCart
    addItemToUserCart: (state, action: PayloadAction<Item>) => {
      const activeUser = _.findIndex(state, { isActive: true });
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
    //removeItemFromCart
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const activeUser = _.findIndex(state, { isActive: true });
      const items = state[activeUser].cart;
      _.remove(items, { itemId: action.payload });
    },

    addItemToOrdered: (state, action: PayloadAction<CartItemStatus>) => {
      const activeUser = _.findIndex(state, { isActive: true });
      const items = state[activeUser].orderedItems;

      items.push({
        orderId: uuid(),
        itemId: action.payload.itemId,
        orderedNum: action.payload.inCartNum,
      });
    },
    // delivery (4)
  },
});

export type { User, OrderedItemStatus, CartItemStatus };
export const {
  addItemToUserCart,
  setActiveUser,
  removeItemFromCart,
  addItemToOrdered,
} = userSlice.actions;
export default userSlice.reducer;
