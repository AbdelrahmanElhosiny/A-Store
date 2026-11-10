import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import {
  User,
  addNewUser,
  setLoggedInUser as setLoggedInUserAction,
  setLoggedOutUser as setLoggedOutUserAction,
} from "../features/userSlice";
import { Item } from "../features/itemSlice";
import { AppDispatch, RootState } from "../app/store";
import useNotification from "./useNotification";

// what the sign-up form asks for
interface SignUpFields {
  userName: string;
  address: string;
  optAddress: string;
  zipCode: string;
  phoneNum: string;
}

// Shared login state, used by the NavBar on both the Sell and Buy sides.
const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector<RootState>((store) => store.users) as User[];
  const items = useSelector<RootState>((store) => store.items) as Item[];
  const { showNotification } = useNotification();

  //------------------
  // definers
  //------------------
  const activeUserIndex = _.findIndex(users, { isLoggedIn: true });
  const activeUserName = users[activeUserIndex].userName;
  const isGuest = activeUserIndex === 0;
  // everyone who can log in (the guest is only the logged-out state)
  const accounts = users.slice(1);
  // what moves to an account on login
  const guestCartNum = _.sumBy(users[0].cart, "inCartNum");
  const guestOrderNum = _.uniqBy(users[0].orderedItems, "orderId").length;
  // e.g. "Your cart (3 items) and 1 order come with you."
  const carryText = (() => {
    if (!isGuest) return null;
    const cart =
      guestCartNum > 0 &&
      `cart (${guestCartNum} ${guestCartNum === 1 ? "item" : "items"})`;
    const orders =
      guestOrderNum > 0 &&
      `${guestOrderNum} ${guestOrderNum === 1 ? "order" : "orders"}`;
    if (cart && orders) return `Your ${cart} and ${orders} come with you.`;
    if (cart) return `Your ${cart} comes with you.`;
    if (orders)
      return `Your ${orders} ${guestOrderNum === 1 ? "comes" : "come"} with you.`;
    return null;
  })();

  //------------------
  // Handlers
  //------------------
  const logIn = (userName: string) => {
    const stockById = Object.fromEntries(
      items.map(({ id, stockNum }) => [id, stockNum]),
    );
    dispatch(setLoggedInUserAction({ userName, stockById }));
  };
  const setLoggedInUser = (userName: string) => {
    logIn(userName);
    showNotification({ message: `Logged in as ${userName}` });
  };
  const setLoggedOutUser = () => {
    dispatch(setLoggedOutUserAction());
    showNotification({ message: "Logged out", type: "info" });
  };
  // adds the account and logs straight into it
  const signUp = (fields: SignUpFields) => {
    const userName = fields.userName.trim();
    dispatch(
      addNewUser({
        userName,
        address: fields.address.trim(),
        optAddress: fields.optAddress.trim(),
        zipCode: fields.zipCode.trim(),
        phoneNum: fields.phoneNum.trim(),
        isLoggedIn: false,
        userType: "buyer",
        cart: [],
        orderedItems: [],
        pillingInfo: [],
      }),
    );
    logIn(userName);
    showNotification({
      message: `Welcome, ${userName}! Your account is ready.`,
    });
  };
  // names are unique, ignoring case and spaces at the ends
  const isNameTaken = (userName: string) =>
    users.some(
      (user) => user.userName.toLowerCase() === userName.trim().toLowerCase(),
    );

  return {
    users,
    accounts,
    activeUserIndex,
    activeUserName,
    isGuest,
    carryText,
    setLoggedInUser,
    setLoggedOutUser,
    signUp,
    isNameTaken,
  };
};

export type { SignUpFields };
export default useAuth;
