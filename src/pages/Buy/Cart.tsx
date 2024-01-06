import styled from "@emotion/styled";
import { Button } from "@mui/material";
import colorD from "../../styles/colorD";
import useBuy from "./useBuy";

const Cart = () => {
  const { users, buyItem } = useBuy();

  return (
    <Holder>
      <h2>Cart</h2>
      <div className="container">
        {users[0].items.map((item) => {
          const { name, description, id, price, stockNum } = item;
          return (
            <div className="card" key={id}>
              <div className="name">{name}</div>
              <div className="description">{description}</div>
              <div className="price">{price}</div>
              <div className="stock-num">{stockNum}</div>
              <Button
                onClick={() => {
                  buyItem(item);
                }}
              >
                Checkout
              </Button>
            </div>
          );
        })}
      </div>
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
  }
`;

export default Cart;
