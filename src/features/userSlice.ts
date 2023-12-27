import { createSlice } from "@reduxjs/toolkit";

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
  isInCart: boolean;
  isOrdered: boolean;
  isShipped: boolean;
  isOutForDelivery: boolean;
  isDelivered: boolean;
}

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
    // checkout
    // delivery (4)
  },
});

export default userSlice.reducer;
