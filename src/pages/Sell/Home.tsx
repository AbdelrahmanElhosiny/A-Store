import styled from "@emotion/styled";
import useSell from "./useSell";
import { Button } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SELL_ROUTE } from "../../constant/routeConstant";
import { color } from "../../styles/tokens";
import RemoveItemModal from "./components/RemoveItemModal";
import UpdateItemModal from "./components/UpdateItemModal";
import { Item } from "../../features/types";
import ProductCard from "../../components/ProductCard";
import EmptyState from "../../components/EmptyState";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { AnimatePresence, m } from "motion/react";
import { listItem } from "../../styles/motion";
import useDocumentTitle from "../../hooks/useDocumentTitle";

type DialogKind = "update" | "remove";

const SellHome = () => {
  const { items } = useSell();
  useDocumentTitle("Your items");
  // the item stays set while its dialog animates out; only the kind is cleared
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [openDialog, setOpenDialog] = useState<DialogKind | null>(null);

  const open = (kind: DialogKind, item: Item) => {
    setSelectedItem(item);
    setOpenDialog(kind);
  };
  const closeDialog = () => setOpenDialog(null);

  const unitNum = items.reduce((sum, { stockNum }) => sum + stockNum, 0);

  return (
    <Holder>
      <div className="head">
        <div>
          <h2>Edit and remove items</h2>
          <p className="summary">
            {items.length} {items.length === 1 ? "item" : "items"} · {unitNum}{" "}
            {unitNum === 1 ? "unit" : "units"} in stock
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to={SELL_ROUTE.ADD_ITEM}
        >
          Add item
        </Button>
      </div>

      <UpdateItemModal
        item={selectedItem}
        isOpen={openDialog === "update"}
        closeDialog={closeDialog}
      />
      <RemoveItemModal
        item={selectedItem}
        isOpen={openDialog === "remove"}
        closeDialog={closeDialog}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Inventory2OutlinedIcon />}
          title="No items yet"
          text="Add your first item and it shows up in the shop right away."
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to={SELL_ROUTE.ADD_ITEM}
          >
            Add item
          </Button>
        </EmptyState>
      ) : (
        <div className="container">
          {/* a removed card shrinks away and the others slide into place */}
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item, index) => (
              <m.div className="cell" key={item.id} {...listItem()}>
                <ProductCard item={item} isPriority={index < 4}>
                  <Button
                    variant="outlined"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => open("update", item)}
                    aria-label={`Update ${item.name}`}
                  >
                    Update
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => open("remove", item)}
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </Button>
                </ProductCard>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Holder>
  );
};

const Holder = styled.div`
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-m);
    margin-bottom: var(--space-l);

    h2 {
      margin: 0;
    }
  }

  .summary {
    margin: var(--space-xs) 0 0;
    color: ${color.fgMuted};
  }

  .container {
    position: relative; /* for the leaving item (popLayout) */
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
    gap: var(--space-l);
  }
  /* the card fills its cell, so cards in a row stay the same height */
  .cell {
    display: grid;
  }
`;

export default SellHome;
