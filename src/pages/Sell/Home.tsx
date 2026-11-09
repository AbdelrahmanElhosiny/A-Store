import styled from "@emotion/styled";
import useSell from "./useSell";
import { Button } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SELL_ROUTE } from "../../constant/routeConstant";
import { color } from "../../styles/tokens";
import RemoveItemModal from "./components/RemoveItemModal";
import UpdateItemModal from "./components/UpdateItemModal";
import { Item } from "../../features/itemSlice";
import ProductCard from "../../components/ProductCard";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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
      )}
      {items.length === 0 && (
        <p className="empty">
          No items yet. <Link to={SELL_ROUTE.ADD_ITEM}>Add your first item</Link>
        </p>
      )}
      <div className="container">
        {items.map((item) => (
          <ProductCard item={item} key={item.id}>
            <Button
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={() => {
                setUpdatedItem(item);
                setRemovedItemName(item.name);
              }}
            >
              Update
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => {
                setRemovedItemId(item.id);
                setRemovedItemName(item.name);
              }}
            >
              Remove
            </Button>
          </ProductCard>
        ))}
      </div>
    </Holder>
  );
};

const Holder = styled.div`
  .container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
    gap: var(--space-l);
  }

  .empty {
    color: ${color.fgMuted};
    a {
      color: ${color.primary};
    }
  }
`;

export default SellHome;
