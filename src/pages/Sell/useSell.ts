import { useDispatch, useSelector } from "react-redux";
import {
  Item,
  addNewItem as addNewItemAction,
  updateItem as updateItemAction,
  removeItem as removeItemAction,
} from "../../features/itemSlice";
import { v4 as uuid } from "uuid";
import { AppDispatch, RootState } from "../../app/store";
import useNotification from "../../hooks/useNotification";
import { OrderedItemStatus, User } from "../../features/userSlice";

interface AddItemFormFields {
  name: string;
  description: string;
  price: string;
  stockNum: string;
  image: string; // data URL from the picker, "" when there is none
}

const useSell = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector<RootState>((store) => store.items) as Item[];
  const users = useSelector<RootState>((store) => store.users) as User[];
  // every buyer's order lines: in this demo there's one seller, the store
  const soldLines: OrderedItemStatus[] = users.flatMap(
    ({ orderedItems }) => orderedItems,
  );
  const { showNotification } = useNotification();

  //------------------
  // Handlers
  //------------------
  const addNewItem = (input: AddItemFormFields) => {
    const { price, stockNum, image, ...rest } = input;
    dispatch(
      addNewItemAction({
        id: uuid(),
        // Number keeps cents: parseInt turned 12.50 into 12
        price: Number(price),
        stockNum: parseInt(stockNum),
        image: image || undefined,
        ...rest,
      })
    );
    showNotification({ message: `${input.name} is added successfully!` });
  };

  const updateItem = (item: Item) => {
    dispatch(updateItemAction(item));
    showNotification({ message: `${item.name} was updated!` });
  };

  const removeItem = (itemId: string | null) => {
    itemId && dispatch(removeItemAction(itemId));
  };

  return { addNewItem, updateItem, removeItem, items, soldLines };
};

export type { AddItemFormFields };
export default useSell;
