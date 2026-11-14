import {
  addNewItem as addNewItemAction,
  updateItem as updateItemAction,
  removeItem as removeItemAction,
} from "../../features/itemSlice";
import { v4 as uuid } from "uuid";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import useNotification from "../../hooks/useNotification";
import { selectActiveStore, selectItemsForStore, selectShipmentsForStore } from "../../features/selectors";
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
  const store = useAppSelector(selectActiveStore);
  const items = useAppSelector((state) => selectItemsForStore(state, store?.id ?? ""));
  const shipments = useAppSelector((state) => selectShipmentsForStore(state, store?.id ?? ""));
  const { showNotification } = useNotification();

  //------------------
  // Handlers
  //------------------
  const addNewItem = (fields: ItemFormFields) => {
    if (!store) return;
    const item = fromFormFields(
      {
        id: uuid(),
        storeId: store.id,
        category: store.categoryFocus,
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
    const ownedItem = items.find(({ id }) => id === current.id);
    if (!ownedItem) return;
    const item = fromFormFields(ownedItem, fields);
    dispatch(updateItemAction(item));
    showNotification({ message: `${item.name} saved` });
  };

  const removeItem = ({ id, name }: Item) => {
    if (!items.some((item) => item.id === id)) return;
    dispatch(removeItemAction(id));
    showNotification({ message: `${name} removed` });
  };

  return { addNewItem, updateItem, removeItem, items, shipments };
};

export type { ItemFormFields };
export { toFormFields };
export default useSell;
