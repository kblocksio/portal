import * as React from "react";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { Project } from "@repo/shared";
import { Combobox } from "@/components/combobox";
import { useAppContext } from "@/app-context";
import { useUser } from "@/hooks/use-user";
import { useSignOut } from "@/hooks/use-sign-out.js";
import { getUserInitials } from "@/lib/user-initials";

function Logo() {
  return (
    <a href="/" className="flex w-8 items-center justify-around">
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

function NotificationBell() {
  const [notifications] = React.useState([
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
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
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
              <Bell className="text-muted-foreground mt-0.5 h-4 w-4" />
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

interface UserProfileProps {
  name: string;
  email: string;
}

function UserProfile(props: UserProfileProps) {
  const initials = getUserInitials(props.name);
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;

  const { signOut } = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
            <AvatarImage src={avatarUrl} alt={`${props.name}'s avatar`} />
          </Avatar>{" "}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <img
            src={avatarUrl}
            alt={`${props.name}'s avatar`}
            className="h-8 w-8 rounded-full"
          />
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{props.name}</p>
            <p className="text-muted-foreground text-sm">{props.email}</p>
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
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const fallbackProject: Project = {
  label: "All projects",
  value: "all",
  description:
    "Below is a comprehensive list of all Kubernetes resources associated with the current account, spanning across all projects added to the application.",
};

export function Header() {
  const [projects, setProjects] = React.useState([fallbackProject]);
  const { data } = useFetch<Project[]>("/api/projects");
  const { setSelectedProject } = useAppContext();
  useEffect(() => {
    if (!data) {
      return;
    }
    setProjects([fallbackProject, ...data]);
  }, [data]);
  const user = useUser();
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b px-4 backdrop-blur">
      <div className="flex h-14 items-center">
        <Logo />
        {/* <div className={"pl-4"}>
          <Combobox
            items={projects}
            fallbackItem={fallbackProject}
            onChange={(value: string) => {
              const currentProject = projects?.filter(
                (project) => project.value === value,
              );
              setSelectedProject(currentProject[0]);
            }}
          />
        </div> */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <NotificationBell />
          <UserProfile
            name={user.user_metadata.name}
            email={user.user_metadata.email}
          />
        </div>
      </div>
    </header>
  );
}
