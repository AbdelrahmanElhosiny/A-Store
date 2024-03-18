import styled from "@emotion/styled";
import { Button } from "@mui/material";
import colorD from "../../styles/colorD";
import useBuy from "./useBuy";
import _ from "lodash";

const Cart = () => {
  const {
    cartItems,
    users,
    buyItem,
    activeUserIndex,
    cartItemsIndex,
    removeItemFromCart,
  } = useBuy();

  const hasCartItem: boolean = cartItems.length > 0;

  return (
    <Holder>
      {hasCartItem && (
        <>
          <h2>Cart</h2>
          <div className="container">
            {cartItems.map((item) => {
              if (!item) return;
              const { name, description, id, price, stockNum } = item;
              return (
                <div className="card" key={id}>
                  <div className="name">{name}</div>
                  <div className="description">{description}</div>
                  <div className="price">{`Price ${price}`}</div>
                  <div className="stock-num">{`StockNum ${stockNum}`}</div>
                  <div className="cart-num-count">{`${
                    users[activeUserIndex].cart[cartItemsIndex(id)].inCartNum
                  } in cart`}</div>
                  <Button
                    onClick={() => {
                      buyItem(users[activeUserIndex].cart[cartItemsIndex(id)]);
                    }}
                  >
                    Checkout
                  </Button>
                  <Button
                    onClick={() => {
                      removeItemFromCart(id);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      )}
      {!hasCartItem && <h2>Cart Empty</h2>}
    </Holder>
  );
};

const Holder = styled.div`
  .container {
    display: grid;
    grid-template-columns: repeat(auto-fill, 15em);
    gap: 2em;
    justify-content: center;

    .card {
      background-color: ${colorD.fg};
      width: 15em;
      height: 20em;
    }
    .cart-num-count {
      font-weight: 900;
    }
  }
`;

export default Cart;
