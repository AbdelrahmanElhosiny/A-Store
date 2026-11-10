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

// the Add Item and Update forms work with text, the store with numbers
interface ItemFormFields {
  name: string;
  description: string;
  price: string;
  stockNum: string;
  image: string; // a URL, or a data URL from the picker; "" when there is none
}

const toFormFields = ({
  name,
  description,
  price,
  stockNum,
  image,
}: Item): ItemFormFields => ({
  name,
  description,
  price: String(price),
  stockNum: String(stockNum),
  image: image ?? "",
});

const fromFormFields = (id: string, fields: ItemFormFields): Item => ({
  id,
  name: fields.name.trim(),
  description: fields.description.trim(),
  // Number keeps cents: parseInt turned 12.50 into 12
  price: Number(fields.price),
  stockNum: Number(fields.stockNum),
  image: fields.image || undefined,
});

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
  const addNewItem = (fields: ItemFormFields) => {
    const item = fromFormFields(uuid(), fields);
    dispatch(addNewItemAction(item));
    showNotification({ message: `${item.name} is now in the shop` });
  };

  const updateItem = (id: string, fields: ItemFormFields) => {
    const item = fromFormFields(id, fields);
    dispatch(updateItemAction(item));
    showNotification({ message: `${item.name} saved` });
  };

  const removeItem = ({ id, name }: Item) => {
    dispatch(removeItemAction(id));
    showNotification({ message: `${name} removed` });
  };

  return { addNewItem, updateItem, removeItem, items, soldLines };
};

export type { ItemFormFields };
export { toFormFields };
export default useSell;
