import { Button } from "@mui/material";
import useSell from "../useSell";
import { useEffect, useRef } from "react";
import styled from "@emotion/styled";

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

  const dialogRef = useRef<HTMLDialogElement>(null);

  // const toggleDialog = () => {
  //   if (!dialogRef.current) {
  //     return;
  //   }
  //   dialogRef.current
  //     ? dialogRef.current.close()
  //     : dialogRef.current.showModal();
  // };

  useEffect(() => {
    itemId && dialogRef.current?.showModal();
  }, [itemId]);

  if (!itemId) return; // Quick exit
  return (
    <Holder ref={dialogRef}>
      <div className="text">Are you sure you want to remove {itemName}</div>
      <Button
        onClick={() => {
          removeItem(itemId);
          closeDialog();
        }}
      >
        Remove
      </Button>
      <Button onClick={closeDialog}>Cancel</Button>
    </Holder>
  );
};

const Holder = styled.dialog``;

export default RemoveItemModal;
