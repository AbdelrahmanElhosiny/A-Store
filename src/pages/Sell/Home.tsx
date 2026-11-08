import styled from "@emotion/styled";
import useSell from "./useSell";
import { Button } from "@mui/material";
import { color } from "../../styles/tokens";
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
      <h2>Edit and remove items</h2>
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
              <div className="price">{`Price ${price}`}</div>
              <div className="stock-num">{`StockNum ${stockNum}`}</div>
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
  }
`;

export default SellHome;
