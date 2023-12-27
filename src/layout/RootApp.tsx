import styled from "@emotion/styled";
import SuccessMessage from "../components/form/NotificationMessage";
import useNotification from "../hooks/useNotification";
import RouterIndex from "../routes/Index";
import font from "../styles/font";

const RootApp = () => {
  const { notification } = useNotification();

  return (
    <Holder>
      {notification.isOpen && <SuccessMessage />}
      <RouterIndex />
    </Holder>
  );
};

const Holder = styled.div`
  ${font.Regular}
`;

export default RootApp;
