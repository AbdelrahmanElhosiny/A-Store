import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import DialogHeader from "./DialogHeader";
import resetDemoData from "../app/resetDemoData";
import { AppDispatch } from "../app/store";
import useNotification from "../hooks/useNotification";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Asks before putting the shop back to its starter data
const ResetDemoDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showNotification } = useNotification();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleReset = () => {
    dispatch(resetDemoData());
    onClose();
    showNotification({ message: "The demo data was reset." });
  };

  return (
    <Holder ref={dialogRef} onClose={onClose} aria-labelledby="reset-title">
      <DialogHeader
        title="Reset demo data"
        titleId="reset-title"
        onClose={onClose}
      />
      <p className="text">
        This brings back the five starter items and removes the items, accounts,
        carts and orders added in this browser. It can't be undone.
      </p>
      <div className="buttons">
        <Button variant="contained" color="error" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="outlined" onClick={onClose}>
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

export default ResetDemoDialog;
