import { useDispatch, useSelector } from "react-redux";
import {
  Notification,
  showNotification as showNotificationAction,
  hideNotification as hideNotificationAction,
} from "../features/notificationSlice";
import { AppDispatch, RootState } from "../app/store";
import { useCallback } from "react";

const useNotification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notification = useSelector<RootState>(
    (store) => store.notification
  ) as Notification;

  //------------------
  // Handlers
  //------------------
  const showNotification = useCallback(
    (input: Omit<Notification, "isOpen">) => {
      dispatch(showNotificationAction(input));
    },
    [dispatch]
  );
  const hideNotification = useCallback(() => {
    dispatch(hideNotificationAction());
  }, [dispatch]);
  return {
    showNotification,
    hideNotification,
    notification,
  };
};

export default useNotification;
