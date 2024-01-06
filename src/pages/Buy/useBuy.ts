import { useDispatch, useSelector } from "react-redux";
import {
  Item,
  buyItem as buyItemAction,
  addToCart as addToCartAction,
} from "../../features/itemSlice";
import {
  User,
  addItemToUserCart as addItemToUserCartAction,
} from "../../features/userSlice";
import { AppDispatch, RootState } from "../../app/store";
import useNotification from "../../hooks/useNotification";

const useBuy = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector<RootState>((store) => store.items) as Item[];
  const users = useSelector<RootState>((store) => store.users) as User[];
  const { showNotification } = useNotification();

  //------------------
  // Handlers
  //------------------
  const buyItem = (item: Item) => {
    dispatch(buyItemAction(item));
  };

  const addToCart = (item: Item) => {
    dispatch(addToCartAction(item));
    showNotification({ message: `${item.name} added to cart!` });
  };

  const addItemToUserCart = (item: Item) => {
    dispatch(addItemToUserCartAction(item));
  };

  return {
    buyItem,
    addToCart,
    addItemToUserCart,
    items,
    users,
  };
};

export default useBuy;
