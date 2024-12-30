import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AudioWaveform, ChevronsUpDown, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/trpc";
import { getIconComponent } from "@/lib/get-icon";

export const AppSidebarHeader = () => {
  const { data: organizations } = trpc.listOrganizations.useQuery();
  const [activeTeam, setActiveTeam] = useState(organizations?.[0]);

  const ActiveTeamIcon = useMemo(() => {
    if (!activeTeam?.icon) return null;
    return getIconComponent({ icon: activeTeam.icon });
  }, [activeTeam]);

  useEffect(() => {
    setActiveTeam(organizations?.[0]);
  }, [organizations]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {ActiveTeamIcon ? <ActiveTeamIcon className="size-4" /> : null}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam?.name}
                </span>
                <span className="truncate text-xs">
                  {activeTeam?.description}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {organizations?.map((org: any, index: number) => {
              const Icon = getIconComponent({ icon: org.icon });
              return (
                <DropdownMenuItem
                  key={org.name}
                  onClick={() => setActiveTeam(org)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Icon className="size-4 shrink-0" />
                  </div>
                  {org.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" disabled>
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
