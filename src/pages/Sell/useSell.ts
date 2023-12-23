import { useDispatch, useSelector } from "react-redux";
import { Item, addNewItem as addNewItemAction } from "../../features/itemSlice";
import { v4 as uuid } from "uuid";
import { AppDispatch, RootState } from "../../app/store";

interface AddItemFormFields {
  name: string;
  description: string;
  price: string;
  stockNum: string;
  image?: File;
}

const useSell = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector<RootState>((store) => store.items) as Item;

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
  };

  return {
    addNewItem,
    items,
  };
};

export type { AddItemFormFields };
export default useSell;
