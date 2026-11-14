import { Button } from "@mui/material";
import styled from "@emotion/styled";
import useSell from "../useSell";
import { Item } from "../../../features/types";
import AppDialog from "../../../components/AppDialog";

interface Props {
  item: Item | null; // kept while the dialog animates out
  isOpen: boolean;
  closeDialog: () => void;
}

const RemoveItemModal: React.FC<Props> = ({ item, isOpen, closeDialog }) => {
  const { removeItem } = useSell();

  if (!item) return null; // Quick exit
  return (
    <AppDialog
      isOpen={isOpen}
      onClose={closeDialog}
      title="Remove item"
      subtitle={item.name}
    >
      <Holder>
        <p className="text">
          Remove this item from the shop? It also leaves any carts it's in. Past
          orders keep it. This can't be undone.
        </p>
        <div className="buttons">
          <Button variant="outlined" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              removeItem(item);
              closeDialog();
            }}
          >
            Remove
          </Button>
        </div>
      </Holder>
    </AppDialog>
  );
};

const Holder = styled.div`
  .text {
    margin: var(--space-m) 0 var(--space-l);
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-s);
  }
`;

export default RemoveItemModal;
