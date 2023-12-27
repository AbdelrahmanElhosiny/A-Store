import { useDispatch, useSelector } from "react-redux";
import {
  Notification,
  showNotification as showNotificationAction,
  hideNotification as hideNotificationAction,
} from "../features/notificationSlice";
import { AppDispatch, RootState } from "../app/store";

const useNotification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notification = useSelector<RootState>(
    (store) => store.notification
  ) as Notification;

  //------------------
  // Handlers
  //------------------
  const showNotification = (input: Omit<Notification, "isOpen">) => {
    dispatch(showNotificationAction(input));
  };
  const hideNotification = () => {
    dispatch(hideNotificationAction());
  };
  return {
    showNotification,
    hideNotification,
    notification,
  };
};

export default useNotification;
