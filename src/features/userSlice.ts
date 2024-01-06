import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Item } from "./itemSlice";
import _ from "lodash";

interface PillingInfo {
  cardNum: number;
  cvv: number;
  expireDate: number;
}

interface User {
  userName: string;
  address: string;
  optAddress?: string;
  zipCode: number;
  phoneNum: number;
  isActive: boolean;
  pillingInfo: PillingInfo[];
  items: Item[];
}
// interface ItemStatus {
//   itemId: string;
//   isInCart: boolean;
//   isOrdered: boolean;
//   isShipped: boolean;
//   isOutForDelivery: boolean;
//   isDelivered: boolean;
// }

const initialState: User[] = [
  {
    userName: "Mohammed Ali",
    address: "abc street",
    optAddress: "",
    zipCode: 123,
    phoneNum: 123,
    isActive: false,
    pillingInfo: [],
    items: [],
  },
];

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // addNewUSer
    // removeUser
    // setActiveUser
    // addToCart
    addItemToUserCart: (state, action: PayloadAction<Item>) => {
      const userName = _.findIndex(state, { userName: "Mohammed Ali" });
      state[userName].items.push(action.payload);
    },
    // checkout
    // delivery (4)
  },
});

export type { User };
export const { addItemToUserCart } = userSlice.actions;
export default userSlice.reducer;
