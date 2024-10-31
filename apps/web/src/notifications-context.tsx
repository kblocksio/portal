import { createContext, ReactNode, useState } from "react";
import { appToast } from "@/components/app-toaster";

export type NotificationType = "success" | "error";
export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
};

export const NotificationsContext = createContext<{
  notifications: Notification[];
  addNotifications: (notifications: Notification[]) => void;
  removeNotifications: (ids: string[]) => void;
  clearNotifications: () => void;
}>({
  notifications: [],
  addNotifications: () => {},
  removeNotifications: () => {},
  clearNotifications: () => {},
});

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotifications = (notifications: Notification[]) => {
    notifications.forEach((notification) => {
      appToast[notification.type](notification.message, {
        id: notification.id,
      });
    });
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      ...notifications,
    ]);
  };

  const removeNotifications = (ids: string[]) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => !ids.includes(notification.id),
      ),
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotifications,
        removeNotifications,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
