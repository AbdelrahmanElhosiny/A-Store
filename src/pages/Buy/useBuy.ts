import { useDispatch, useSelector } from "react-redux";
import { Item, buyItem as buyItemAction } from "../../features/itemSlice";
import {
  addItemToUserCart as addItemToUserCartAction,
  removeItemFromCart as removeItemFromCartAction,
  setCartItemNum as setCartItemNumAction,
  addItemToOrdered as addItemToOrderedAction,
  CartItemStatus,
} from "../../features/userSlice";
import { AppDispatch, RootState } from "../../app/store";
import _ from "lodash";
import useAuth from "../../hooks/useAuth";
// import useNotification from "../../hooks/useNotification";

const useBuy = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector<RootState>((store) => store.items) as Item[];
  const {
    users,
    activeUserIndex,
    activeUserName,
    setLoggedInUser,
    setLoggedOutUser,
  } = useAuth();
  // const { showNotification } = useNotification();

  //------------------
  // definers
  //------------------
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
  const orderItem = (item: CartItemStatus) => {
    dispatch(addItemToOrderedAction(item));
    dispatch(buyItemAction(item));
  };

  const addItemToUserCart = (item: Item) => {
    dispatch(addItemToUserCartAction(item));
  };

  const setCartItemNum = (itemId: string, inCartNum: number) => {
    dispatch(setCartItemNumAction({ itemId, inCartNum }));
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
    activeUserName,
    cartItemsIndex,
    removeItemFromCart,
    setCartItemNum,
    orderItem,
  };
};

export default useBuy;
