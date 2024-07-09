import { useDispatch, useSelector } from "react-redux";
import { Item, buyItem as buyItemAction } from "../../features/itemSlice";
import {
  OrderedItemStatus,
  User,
  addItemToUserCart as addItemToUserCartAction,
  setLoggedInUser as setLoggedInUserAction,
  setLoggedOutUser as setLoggedOutUserAction,
  removeItemFromCart as removeItemFromCartAction,
  addItemToOrdered as addItemToOrderedAction,
  CartItemStatus,
} from "../../features/userSlice";
import { AppDispatch, RootState } from "../../app/store";
import _ from "lodash";
// import useNotification from "../../hooks/useNotification";

const useBuy = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector<RootState>((store) => store.items) as Item[];
  const users = useSelector<RootState>((store) => store.users) as User[];
  // const { showNotification } = useNotification();

  //------------------
  // definers
  //------------------
  const activeUserIndex = _.findIndex(users, { isLoggedIn: true });
  const cartItemsIds = users[activeUserIndex].cart.map(({ itemId }) => itemId);
  const cartItems = items
    .map((item) => {
      const isItemInCart = _.includes(cartItemsIds, item.id);
      return isItemInCart && item;
    })
    .filter((item) => !!item);

  const cartItemsIndex = (itemId: string) =>
    _.findIndex(users[activeUserIndex].cart, { itemId: itemId });

  //------------------
  // Handlers
  //------------------
  const setLoggedInUser = () => {
    dispatch(setLoggedInUserAction("Omar"));
  };
  const setLoggedOutUser = () => {
    dispatch(setLoggedOutUserAction("Omar"));
  };

  const orderItem = (item: CartItemStatus) => {
    dispatch(addItemToOrderedAction(item));
    dispatch(buyItemAction(item));
  };

  const addItemToUserCart = (item: Item) => {
    dispatch(addItemToUserCartAction(item));
  };

  const removeItemFromCart = (itemId: string) => {
    dispatch(removeItemFromCartAction(itemId));
  };

  return {
    setLoggedInUser,
    setLoggedOutUser,
    addItemToUserCart,
    activeUserIndex,
    items,
    cartItems,
    users,
    cartItemsIndex,
    removeItemFromCart,
    orderItem,
  };
};

export default useBuy;
