import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  addItemToCart as addItemToCartAction,
  setCartQuantity as setCartQuantityAction,
} from "../../features/cartActions";
import { placeOrder as placeOrderAction } from "../../features/orderActions";
import {
  selectCart,
  selectItemsById,
  selectShopItems,
} from "../../features/selectors";
import { Address, Item, Order } from "../../features/types";

// a cart line joined with its item
interface CartRow {
  item: Item;
  quantity: number;
  // what can actually be ordered: the stock may have dropped since adding
  orderableNum: number;
}

const useBuy = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectShopItems);
  const itemsById = useAppSelector(selectItemsById);
  const cart = useAppSelector(selectCart);

  //------------------
  // definers
  //------------------
  // cart lines joined with their items (skips items the seller removed)
  const cartRows: CartRow[] = cart.flatMap(({ itemId, quantity }) => {
    const item = itemsById[itemId];
    if (!item) return [];
    const orderableNum = Math.min(quantity, item.stockNum);
    return [{ item, quantity, orderableNum }];
  });

  //------------------
  // Handlers
  //------------------
  const addItemToCart = (item: Item) => {
    dispatch(addItemToCartAction(item));
  };

  const setCartQuantity = (itemId: string, quantity: number) => {
    dispatch(setCartQuantityAction(itemId, quantity));
  };

  // orders everything in the cart that's in stock; null when nothing could be
  const placeOrder = (args: { shipTo: Address; payment: Order["payment"] }) =>
    dispatch(placeOrderAction(args));

  return {
    items,
    cart,
    cartRows,
    addItemToCart,
    setCartQuantity,
    placeOrder,
  };
};

export type { CartRow };
export default useBuy;
