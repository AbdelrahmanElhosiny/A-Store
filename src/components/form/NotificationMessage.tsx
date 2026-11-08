import styled from "@emotion/styled";
import { color } from "../../styles/tokens";
import { IconButton } from "@mui/material";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import useNotification from "../../hooks/useNotification";

const NotificationMessage = () => {
  const { hideNotification, notification } = useNotification();

  return (
    <Holder>
      <div className="text">{notification.message}</div>
      <IconButton
        onClick={hideNotification}
        aria-label="Close notification"
        color="inherit"
      >
        <DisabledByDefaultIcon />
      </IconButton>
    </Holder>
  );
};

const Holder = styled.div`
  position: fixed;
  top: var(--nav-height);
  right: 0;
  left: 0;
  height: max-content;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${color.yellow};
  color: ${color.bg};
  padding-inline: var(--page-gutter);
  gap: var(--space-m);
  z-index: 100;
`;

export default NotificationMessage;
