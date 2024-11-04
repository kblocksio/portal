import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsContext } from "@/notifications-context";
import { Link } from "./ui/link";

type NotificationType = "success" | "error";

export interface NotificationMenuProps {
  className?: string;
}

export const NotificationMenu = ({ className }: NotificationMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const { notifications, clearNotifications } =
    useContext(NotificationsContext);

  useEffect(() => {
    setHasNewNotifications(notifications.length > 0);
  }, [notifications]);

  const handleClearAllNotifications = useCallback(() => {
    setIsOpen(false);
    clearNotifications();
  }, [clearNotifications]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="relative ml-auto">
      <DropdownMenu
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setHasNewNotifications(false);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative" size="icon">
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            {hasNewNotifications && (
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-[500px] w-[300px] overflow-y-auto"
        >
          {notifications.length > 0 ? (
            <>
              {notifications.map((notification, index) => (
                <DropdownMenuItem
                  key={`${notification.id}_${index}`}
                  className="flex items-center space-x-2 p-2"
                >
                  <Link
                    to={notification.id as any}
                    className="flex items-center space-x-2 truncate"
                  >
                    {getIcon(notification.type)}
                    <span className="flex-1 truncate">
                      {notification.message}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button
                  variant="ghost"
                  className="mt-2 w-full"
                  onClick={handleClearAllNotifications}
                >
                  Clear all notifications
                </Button>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem className="place-content-center">
              No new notifications
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
