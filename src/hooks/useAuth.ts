import { v4 as uuid } from "uuid";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addBuyer } from "../features/accountsSlice";
import { logInAs } from "../features/cartActions";
import { logOut as logOutAction } from "../features/sessionSlice";
import {
  selectActiveBuyer,
  selectActiveSeller,
  selectActiveStore,
  selectSellerAccounts,
  selectBuyerAccounts,
  selectCartCount,
} from "../features/selectors";
import { Account, BuyerAccount } from "../features/types";
import { color } from "../styles/tokens";
import useSide from "./useSide";
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

// The URL selects the role; both sessions remain independent.
const useAuth = () => {
  const dispatch = useAppDispatch();
  const { role } = useSide();
  const activeBuyer = useAppSelector(selectActiveBuyer);
  const activeSeller = useAppSelector(selectActiveSeller);
  const activeStore = useAppSelector(selectActiveStore);
  const buyers = useAppSelector(selectBuyerAccounts);
  const sellers = useAppSelector(selectSellerAccounts);
  const stores = useAppSelector((state) => state.stores);
  const accounts: Account[] = role === "buyer" ? buyers : sellers;
  const activeAccount: Account | null = role === "buyer" ? activeBuyer : activeSeller;
  const activeName = role === "buyer" ? activeAccount?.name ?? null : activeStore?.name ?? null;
  const isSignedIn = activeAccount !== null;
  const cartCount = useAppSelector(selectCartCount);
  const { showNotification } = useNotification();
  const carryText = role === "buyer" && !isSignedIn && cartCount > 0
    ? `Your cart (${cartCount} ${cartCount === 1 ? "item" : "items"}) comes with you.`
    : null;

  const logIn = (accountId: string) => {
    const account = accounts.find(({ id }) => id === accountId);
    if (!account || !dispatch(logInAs(role, accountId))) return;
    const store = account.role === "seller" ? stores.find(({ id }) => id === account.storeId) : null;
    showNotification({ message: store ? `Logged in to ${store.name}` : `Logged in as ${account.name}` });
  };
  const logOut = () => {
    dispatch(logOutAction({ role }));
    showNotification({ message: "Logged out", type: "info" });
  };
  // adds the account and logs straight into it
  const signUp = (fields: SignUpFields) => {
    if (role !== "buyer" || isNameTaken(fields.userName)) return;
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
  // Names are unique within the current role, ignoring case and outer spaces.
  const isNameTaken = (userName: string) => {
    const name = userName.trim().toLowerCase();
    return (
      (role === "buyer" && name === GUEST_NAME.toLowerCase()) ||
      accounts.some((account) => account.name.trim().toLowerCase() === name)
    );
  };

  return {
    accounts,
    role,
    activeAccount,
    activeName,
    isSignedIn,
    carryText,
    logIn,
    logOut,
    signUp,
    isNameTaken,
  };
};

export type { SignUpFields };
export default useAuth;
