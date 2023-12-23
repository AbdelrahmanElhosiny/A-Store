import { useDispatch } from "react-redux";
import { addNewItem as addNewItemAction } from "../../features/itemSlice";
import { v4 as uuid } from "uuid";

interface AddItemFormFields {
  name: string;
  description: string;
  price: string;
  stockNum: string;
  image?: File;
}

const useSell = () => {
  const dispatch = useDispatch();

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
  };
};

export type { AddItemFormFields };
export default useSell;
