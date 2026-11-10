import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { Item, buyItem as buyItemAction } from "../../features/itemSlice";
import {
  addItemToUserCart as addItemToUserCartAction,
  removeItemFromCart as removeItemFromCartAction,
  setCartItemNum as setCartItemNumAction,
  placeOrder as placeOrderAction,
  OrderedItemStatus,
} from "../../features/userSlice";
import { AppDispatch, RootState } from "../../app/store";
import useAuth from "../../hooks/useAuth";

interface CartLine {
  item: Item;
  inCartNum: number;
  // what can actually be ordered: the stock may have dropped since adding
  orderableNum: number;
}

const useBuy = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector<RootState>((store) => store.items) as Item[];
  const {
    users,
    activeUserIndex,
    activeUserName,
    setLoggedInUser,
    setLoggedOutUser,
  } = useAuth();

  //------------------
  // definers
  //------------------
  const activeUser = users[activeUserIndex];

  // cart entries joined with their items (skips items the seller removed)
  const cartLines: CartLine[] = activeUser.cart.flatMap(
    ({ itemId, inCartNum }) => {
      const item = items.find(({ id }) => id === itemId);
      if (!item) return [];
      const orderableNum = Math.min(inCartNum, item.stockNum);
      return [{ item, inCartNum, orderableNum }];
    },
  );

  const orderedItems: OrderedItemStatus[] = activeUser.orderedItems;

  //------------------
  // Handlers
  //------------------
  const addItemToUserCart = (item: Item) => {
    dispatch(addItemToUserCartAction(item));
  };

  const setCartItemNum = (itemId: string, inCartNum: number) => {
    dispatch(setCartItemNumAction({ itemId, inCartNum }));
  };

  const removeItemFromCart = (itemId: string) => {
    dispatch(removeItemFromCartAction(itemId));
  };

  // orders everything in the cart that's in stock; returns the order id
  const placeOrder = (): string | null => {
    const orderId = uuid();
    const orderedAt = Date.now();
    const lines: OrderedItemStatus[] = cartLines
      .filter(({ orderableNum }) => orderableNum > 0)
      .map(({ item, orderableNum }) => ({
        orderId,
        orderedAt,
        itemId: item.id,
        orderedNum: orderableNum,
        name: item.name,
        price: item.price,
        image: item.image,
      }));
    if (lines.length === 0) return null;

    lines.forEach(({ itemId, orderedNum }) =>
      dispatch(buyItemAction({ itemId, inCartNum: orderedNum })),
    );
    dispatch(placeOrderAction(lines));
    return orderId;
  };

  return {
    setLoggedInUser,
    setLoggedOutUser,
    addItemToUserCart,
    activeUserIndex,
    items,
    cartLines,
    orderedItems,
    users,
    activeUserName,
    setCartItemNum,
    removeItemFromCart,
    placeOrder,
  };
};

export type { CartLine };
export default useBuy;
