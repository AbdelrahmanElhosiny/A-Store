import {
  addNewItem as addNewItemAction,
  updateItem as updateItemAction,
  removeItem as removeItemAction,
} from "../../features/itemSlice";
import { v4 as uuid } from "uuid";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import useNotification from "../../hooks/useNotification";
import { selectAllOrders } from "../../features/selectors";
import { Item } from "../../features/types";

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

// the form's fields on top of the rest of the item
const fromFormFields = (item: Item, fields: ItemFormFields): Item => ({
  ...item,
  name: fields.name.trim(),
  description: fields.description.trim(),
  // Number keeps cents: parseInt turned 12.50 into 12
  price: Number(fields.price),
  stockNum: Number(fields.stockNum),
  image: fields.image || undefined,
});

const useSell = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.items);
  // every order: until stores have their own pages, the seller is the shop
  const orders = useAppSelector(selectAllOrders);
  const { showNotification } = useNotification();

  //------------------
  // Handlers
  //------------------
  const addNewItem = (fields: ItemFormFields) => {
    const item = fromFormFields(
      {
        id: uuid(),
        // Phase B: active seller's store
        storeId: "store-hearth-lane",
        category: "home-kitchen",
        status: "active",
        sku: "",
        createdAt: Date.now(),
        name: "",
        description: "",
        price: 0,
        stockNum: 0,
      },
      fields,
    );
    dispatch(addNewItemAction(item));
    showNotification({ message: `${item.name} is now in the shop` });
  };

  const updateItem = (current: Item, fields: ItemFormFields) => {
    const item = fromFormFields(current, fields);
    dispatch(updateItemAction(item));
    showNotification({ message: `${item.name} saved` });
  };

  const removeItem = ({ id, name }: Item) => {
    dispatch(removeItemAction(id));
    showNotification({ message: `${name} removed` });
  };

  return { addNewItem, updateItem, removeItem, items, orders };
};

export type { ItemFormFields };
export { toFormFields };
export default useSell;
