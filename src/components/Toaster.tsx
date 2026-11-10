import styled from "@emotion/styled";
import { IconButton, Snackbar, SnackbarCloseReason } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import useNotification from "../hooks/useNotification";
import { color } from "../styles/tokens";

const icons = {
  success: <CheckCircleOutlineIcon />,
  error: <ErrorOutlineIcon />,
  info: <InfoOutlinedIcon />,
  warning: <WarningAmberIcon />,
};

// Short messages ("Desk lamp removed") that hide on their own.
// Problems stay up longer so there's time to read them.
const Toaster = () => {
  const { notification, hideNotification } = useNotification();
  const type = notification.type ?? "success";
  const isProblem = type === "error" || type === "warning";

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    // a click elsewhere on the page doesn't dismiss it
    if (reason === "clickaway") return;
    hideNotification();
  };

  return (
    <Snackbar
      key={notification.id}
      open={notification.isOpen}
      onClose={handleClose}
      autoHideDuration={isProblem ? 8000 : 4000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Holder className={type} role={isProblem ? "alert" : "status"}>
        <span className="icon" aria-hidden="true">
          {icons[type]}
        </span>
        <span className="message">{notification.message}</span>
        <IconButton
          className="close"
          size="small"
          aria-label="Dismiss"
          onClick={hideNotification}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Holder>
    </Snackbar>
  );
};

// inverted colours stand out on either theme; the bar shows the kind
const Holder = styled.div`
  --kind-color: ${color.green};
  &.error {
    --kind-color: ${color.red};
  }
  &.warning {
    --kind-color: ${color.yellow};
  }
  &.info {
    --kind-color: ${color.primary};
  }

  display: flex;
  align-items: center;
  gap: var(--space-s);
  width: min(100%, 480px);
  min-height: 48px;
  padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-m);
  background-color: ${color.fg};
  color: ${color.bg};
  border-left: 6px solid var(--kind-color);
  box-shadow: var(--shadow-2);

  .icon {
    display: flex;
  }

  .message {
    flex: 1;
    padding-block: var(--space-s);
    font-weight: 500;
  }

  .close {
    color: inherit;
  }
`;

export default Toaster;
