import styled from "@emotion/styled";
import { Button } from "@mui/material";
import { color } from "../../styles/tokens";
import useBuy from "./useBuy";

//TODO: make the page optional so it wont give an error if seller user

const Cart = () => {
  const {
    cartItems,
    users,
    activeUserIndex,
    cartItemsIndex,
    removeItemFromCart,
    orderItem,
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
                      orderItem(
                        users[activeUserIndex].cart[cartItemsIndex(id)]
                      );
                      removeItemFromCart(id);
                    }}
                  >
                    Order
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
    grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
    gap: var(--space-l);

    .card {
      background-color: ${color.bg1};
      border: 1px solid ${color.bg2};
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      padding: var(--space-m);
      min-width: 0;
      overflow-wrap: anywhere;

      .MuiButton-root {
        align-self: flex-start;
      }
    }
    .cart-num-count {
      font-weight: 900;
    }
  }
`;

export default Cart;
