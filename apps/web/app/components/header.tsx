import * as React from "react";
import { Bell, LogOut, Search, Settings, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function Logo() {
  return (
    <a href="/" className="flex items-center space-x-2">
      <img
        src="/wing.svg"
        alt="Wing Logo"
        className="h-6 w-6"
        width={24}
        height={24}
      />
    </a>
  );
}

function SearchBar() {
  return (
    <div className="relative max-w-xs w-full">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search..." className="pl-8" />
    </div>
  );
}

function NotificationBell() {
  const [notifications, setNotifications] = React.useState([
    { id: 1, message: "New feature released!" },
    { id: 2, message: "You have a new message" },
    { id: 3, message: "Your subscription will expire soon" },
  ]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">Notifications</h3>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-4 text-sm"
            >
              <Bell className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="grid gap-1">
                <p>{notification.message}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function UserProfile() {
  const userName = "John Doe";
  const userEmail = "john@example.com";
  const initials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
            <AvatarImage src={avatarUrl} alt={`${userName}'s avatar`} />
          </Avatar>{" "}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <img
            src={avatarUrl}
            alt={`${userName}'s avatar`}
            className="h-8 w-8 rounded-full"
          />
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{userName}</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex h-14 items-center">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <SearchBar />
          <NotificationBell />
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
