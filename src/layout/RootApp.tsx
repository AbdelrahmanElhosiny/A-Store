import styled from "@emotion/styled";
import NotificationMessage from "../components/form/NotificationMessage";
import useNotification from "../hooks/useNotification";
import RouterIndex from "../routes/Index";
import font from "../styles/font";

const RootApp = () => {
  const { notification } = useNotification();

  return (
    <Holder>
      {notification.isOpen && <NotificationMessage />}
      <RouterIndex />
    </Holder>
  );
};

const Holder = styled.div`
  ${font.Regular}
`;

export default RootApp;
