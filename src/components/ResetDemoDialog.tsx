import { useDispatch } from "react-redux";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import AppDialog from "./AppDialog";
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

  const handleReset = () => {
    dispatch(resetDemoData());
    onClose();
    showNotification({ message: "Demo data reset" });
  };

  return (
    <AppDialog isOpen={isOpen} onClose={onClose} title="Reset demo data">
      <Holder>
        <p className="text">
          This brings back the five starter items and removes the items,
          accounts, carts and orders added in this browser. It can't be undone.
        </p>
        <div className="buttons">
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleReset}>
            Reset
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

export default ResetDemoDialog;
