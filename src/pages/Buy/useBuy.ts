import { useDispatch, useSelector } from "react-redux";
import {
  Item,
  buyItem as buyItemAction,
  addToCart as addToCartAction,
} from "../../features/itemSlice";
import { AppDispatch, RootState } from "../../app/store";
import useNotification from "../../hooks/useNotification";

const useBuy = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector<RootState>((store) => store.items) as Item[];
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

  return {
    buyItem,
    addToCart,
    items,
  };
};

export default useBuy;
