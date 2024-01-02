import styled from "@emotion/styled";
import useSell from "./useSell";
import { Button } from "@mui/material";
import colorD from "../../styles/colorD";
import { useState } from "react";
import RemoveItemModal from "./components/RemoveItemModal";
import UpdateItemModal from "./components/UpdateItemModal";
import { Item } from "../../features/itemSlice";

const SellHome = () => {
  const { items } = useSell();
  const [removedItemId, setRemovedItemId] = useState<string | null>(null);
  const [removedItemName, setRemovedItemName] = useState<string | null>(null);
  const [updatedItem, setUpdatedItem] = useState<Item | null>(null);

  return (
    <Holder>
      <h1>Edit and remove items</h1>
      <RemoveItemModal
        itemId={removedItemId}
        itemName={removedItemName}
        closeDialog={() => setRemovedItemId(null)}
      />
      {updatedItem && (
        <UpdateItemModal
          item={updatedItem}
          itemName={removedItemName}
          closeDialog={() => setUpdatedItem(null)}
        />
      )}{" "}
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
                  setUpdatedItem(item);
                  setRemovedItemName(name);
                }}
              >
                Update
              </Button>
              <Button
                onClick={() => {
                  setRemovedItemId(id);
                  setRemovedItemName(name);
                }}
              >
                Remove
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

export default SellHome;
