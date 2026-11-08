import { Button } from "@mui/material";
import useSell from "../useSell";
import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import useNotification from "../../../hooks/useNotification";
import DialogHeader from "../../../components/DialogHeader";

interface Props {
  itemId: string | null;
  itemName: string | null;
  closeDialog: () => void;
}

const RemoveItemModal: React.FC<Props> = ({
  itemId,
  itemName,
  closeDialog,
}) => {
  const { removeItem } = useSell();
  const { showNotification } = useNotification();

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    itemId && dialogRef.current?.showModal();
  }, [itemId]);

  if (!itemId) return; // Quick exit
  return (
    <Holder ref={dialogRef} onClose={closeDialog}>
      <DialogHeader
        title="Remove item"
        subtitle={itemName}
        onClose={closeDialog}
      />
      <p className="text">
        Remove this item from the store? This can't be undone.
      </p>
      <div className="buttons">
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            removeItem(itemId);
            closeDialog();
            showNotification({ message: `${itemName} was removed!` });
          }}
        >
          Remove
        </Button>
        <Button variant="outlined" onClick={closeDialog}>
          Cancel
        </Button>
      </div>
    </Holder>
  );
};

const Holder = styled.dialog`
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
