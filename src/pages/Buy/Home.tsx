import styled from "@emotion/styled";
import { Button } from "@mui/material";
import colorD from "../../styles/colorD";
import useBuy from "./useBuy";

const BuyHome = () => {
  const { items, addToCart, addItemToUserCart } = useBuy();

  return (
    <Holder>
      <h2>Buy items</h2>
      <div className="container">
        {items.map((item) => {
          const { name, description, id, price, stockNum } = item;
          return (
            <div className="card" key={id}>
              <div className="name">{name}</div>
              <div className="description">{description}</div>
              <div className="price">{price}</div>
              <div className="stock-num">{stockNum}</div>
              <Button
                onClick={() => {
                  addToCart(item);
                  addItemToUserCart(item);
                }}
              >
                Add to cart
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

export default BuyHome;
