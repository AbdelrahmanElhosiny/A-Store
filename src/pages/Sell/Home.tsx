import styled from "@emotion/styled";
import useSell from "./useSell";
import { Button } from "@mui/material";
import colorD from "../../styles/colorD";
import { useState } from "react";

const SellHome = () => {
  const { items, removeItem } = useSell();
  const [removedItemId, setRemovedItemId] = useState<string | null>(null);

  return (
    <Holder>
      <h1>Edit and remove items</h1>
      <Button onClick={() => removeItem(removedItemId)}>Remove</Button>
      <div className="container">
        {items.map((item) => {
          const { name, description, id, price, stockNum } = item;
          return (
            <div className="card" key={id}>
              <div className="name">{name}</div>
              <div className="price">{price}</div>
              <div className="description">{description}</div>
              <div className="stock-num">{stockNum}</div>
              <Button>Update</Button>
              <Button onClick={() => setRemovedItemId(id)}>Remove</Button>
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

export default SellHome;
