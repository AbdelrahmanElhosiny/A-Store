import { useDispatch, useSelector } from "react-redux";
import {
  Item,
  addNewItem as addNewItemAction,
  updateItem as updateItemAction,
  removeItem as removeItemAction,
  buyItem as buyItemAction,
} from "../../features/itemSlice";
import { v4 as uuid } from "uuid";
import { AppDispatch, RootState } from "../../app/store";
import useNotification from "../../hooks/useNotification";

interface AddItemFormFields {
  name: string;
  description: string;
  price: string;
  stockNum: string;
  buyNum: number;
  image?: File;
}

const useSell = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector<RootState>((store) => store.items) as Item[];
  const { showNotification } = useNotification();

  //------------------
  // Handlers
  //------------------
  const addNewItem = (input: AddItemFormFields) => {
    const { price, stockNum, ...rest } = input;
    dispatch(
      addNewItemAction({
        id: uuid(),
        price: parseInt(price),
        stockNum: parseInt(stockNum),
        ...rest,
      })
    );
    showNotification({ message: `${input.name} is added successfully!` });
  };

  const updateItem = (item: Item) => {
    dispatch(updateItemAction(item));
  };

  const removeItem = (itemId: string | null) => {
    itemId && dispatch(removeItemAction(itemId));
  };

  const buyItem = (item: Item) => {
    dispatch(buyItemAction(item));
  };

  return {
    addNewItem,
    updateItem,
    removeItem,
    buyItem,
    items,
  };
};

export type { AddItemFormFields };
export default useSell;
