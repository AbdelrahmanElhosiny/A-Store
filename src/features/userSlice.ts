import { PayloadAction, createSlice } from "@reduxjs/toolkit";
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
  items: ItemStatus[];
}
interface ItemStatus {
  itemId: string;
  inCartNum: number;
  // isOrdered?: boolean;
  // isShipped?: boolean;
  // isOutForDelivery?: boolean;
  // isDelivered?: boolean;
}

const initialState: User[] = [
  {
    userName: "Mohammed Ali",
    address: "abc street",
    optAddress: "",
    zipCode: 123,
    phoneNum: 123,
    isActive: true,
    pillingInfo: [],
    items: [],
  },
  {
    userName: "Ali Ahmed",
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
    setActiveUser: (state) => {
      _.map(state, { isActive: false });
    },
    // addItemToCart
    addItemToUserCart: (state, action: PayloadAction<string>) => {
      const activeUser = _.findIndex(state, { isActive: true });
      const items = state[activeUser].items;
      const isItemAddedToCartBefore = _.includes(
        _.map(items, "itemId"),
        action.payload
      );
      const itemInCartIndex = items.findIndex(
        ({ itemId }) => itemId === action.payload
      );

      if (isItemAddedToCartBefore) {
        items[itemInCartIndex].inCartNum++;
        return;
      } else items.push({ itemId: action.payload, inCartNum: 1 });
    },
    //removeItemFromCart
    removeItemFromCart: () => {},
    setItemOrdered: () => {}, //this will happened before you remove item if you bought it
    // delivery (4)
  },
});

export type { User, ItemStatus };
export const { addItemToUserCart, setActiveUser } = userSlice.actions;
export default userSlice.reducer;
