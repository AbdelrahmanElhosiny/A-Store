import { useDispatch, useSelector } from "react-redux";
import { Item, buyItem as buyItemAction } from "../../features/itemSlice";
import {
  ItemStatus,
  User,
  addItemToUserCart as addItemToUserCartAction,
  setActiveUser as setActiveUserAction,
} from "../../features/userSlice";
import { AppDispatch, RootState } from "../../app/store";
import _ from "lodash";
// import useNotification from "../../hooks/useNotification";

const useBuy = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector<RootState>((store) => store.items) as Item[];
  const users = useSelector<RootState>((store) => store.users) as User[];
  // const { showNotification } = useNotification();

  const activeUserIndex = _.findIndex(users, { isActive: true });

  const cartItemsIds = users[activeUserIndex].items.map(({ itemId }) => itemId);
  const cartItems = items
    .map((item) => {
      const isItemInCart = _.includes(cartItemsIds, item.id);
      return isItemInCart && item;
    })
    .filter((item) => !!item);

  //------------------
  // Handlers
  //------------------
  const setActiveUser = () => {
    dispatch(setActiveUserAction());
  };

  const buyItem = (item: ItemStatus) => {
    dispatch(buyItemAction(item));
  };

  const addItemToUserCart = (itemId: string) => {
    dispatch(addItemToUserCartAction(itemId));
  };

  return {
    setActiveUser,
    buyItem,
    addItemToUserCart,
    activeUserIndex,
    items,
    cartItems,
    users,
  };
};

export default useBuy;
