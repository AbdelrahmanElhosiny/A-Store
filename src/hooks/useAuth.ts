import { v4 as uuid } from "uuid";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addBuyer } from "../features/accountsSlice";
import { logInAs } from "../features/cartActions";
import { logOut } from "../features/sessionSlice";
import {
  selectActiveBuyer,
  selectBuyerAccounts,
  selectCartCount,
} from "../features/selectors";
import { BuyerAccount } from "../features/types";
import { color } from "../styles/tokens";
import useNotification from "./useNotification";

// what the sign-up form asks for
interface SignUpFields {
  userName: string;
  address: string;
  optAddress: string;
  zipCode: string;
  phoneNum: string;
}

// the signed-out shopper; nobody can sign up with this name
const GUEST_NAME = "Guest";

// Shared buyer login state, used by the NavBar on both the Sell and Buy sides.
const useAuth = () => {
  const dispatch = useAppDispatch();
  const activeBuyer = useAppSelector(selectActiveBuyer);
  // everyone who can log in
  const accounts = useAppSelector(selectBuyerAccounts);
  const cartCount = useAppSelector(selectCartCount);
  const { showNotification } = useNotification();

  //------------------
  // definers
  //------------------
  const isGuest = activeBuyer === null;
  const activeUserName = activeBuyer?.name ?? GUEST_NAME;
  // what moves to an account on login, e.g. "Your cart (3 items) comes with you."
  const carryText =
    isGuest && cartCount > 0
      ? `Your cart (${cartCount} ${cartCount === 1 ? "item" : "items"}) comes with you.`
      : null;

  //------------------
  // Handlers
  //------------------
  const setLoggedInUser = (accountId: string) => {
    const account = accounts.find(({ id }) => id === accountId);
    if (!account || !dispatch(logInAs("buyer", accountId))) return;
    showNotification({ message: `Logged in as ${account.name}` });
  };
  const setLoggedOutUser = () => {
    dispatch(logOut({ role: "buyer" }));
    showNotification({ message: "Logged out", type: "info" });
  };
  // adds the account and logs straight into it
  const signUp = (fields: SignUpFields) => {
    const name = fields.userName.trim();
    const now = Date.now();
    const optAddress = fields.optAddress.trim();
    const account: BuyerAccount = {
      id: `acc-${uuid()}`,
      role: "buyer",
      name,
      avatarColor: color.buy,
      createdAt: now,
      notificationsSeenAt: now,
      addresses: [
        {
          id: uuid(),
          label: "Home",
          name,
          line1: fields.address.trim(),
          ...(optAddress && { line2: optAddress }),
          // the form has no city field; the address book fills it in later
          city: "",
          zipCode: fields.zipCode.trim(),
          phoneNum: fields.phoneNum.trim(),
          isDefault: true,
        },
      ],
      paymentMethods: [{ id: "cod", kind: "cod", isDefault: true }],
      cart: [],
      wishlist: [],
      recentlyViewed: [],
    };
    dispatch(addBuyer(account));
    dispatch(logInAs("buyer", account.id));
    showNotification({
      message: `Welcome, ${name}! Your account is ready.`,
    });
  };
  // buyer names are unique, ignoring case and spaces at the ends
  const isNameTaken = (userName: string) => {
    const name = userName.trim().toLowerCase();
    return (
      name === GUEST_NAME.toLowerCase() ||
      accounts.some((account) => account.name.toLowerCase() === name)
    );
  };

  return {
    accounts,
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
