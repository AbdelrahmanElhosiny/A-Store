import { createSlice } from "@reduxjs/toolkit";

interface InitialState {
  userName: string;
  address: string;
  optAddress?: string;
  zipCode: number;
  cardNum: number;
  phoneNum: number;
}

const initialState: InitialState = {
  userName: "",
  address: "",
  optAddress: "",
  zipCode: 0,
  cardNum: 0,
  phoneNum: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
});

export default userSlice.reducer;
