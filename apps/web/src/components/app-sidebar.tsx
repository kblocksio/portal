import { useContext, useEffect, useMemo, useState } from "react";

import {
  Sidebar,
  SidebarRail,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar.js";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.js";
import { AppSidebarFooter } from "./app-sidebar-footer";
import { AppSidebarHeader } from "./app-sidebar-header";
import { useAppContext } from "@/app-context";
import { getLucideIcon } from "@/lib/lucide-icon";
import { Link } from "./ui/link";
import { useLocation } from "@tanstack/react-router";
import { ResourceContext } from "@/resource-context";

export const AppSidebar = () => {
  const { projects } = useAppContext();
  const { resourceTypes } = useContext(ResourceContext);

  const location = useLocation();

  const platformSideBarItems = useMemo(() => {
    return [
      {
        title: "Home",
        url: "/",
        icon: "Home",
        isActive: true,
      },
      {
        title: "Resources",
        url: "/resources",
        icon: "LayoutDashboard",
      },
      {
        title: "Catalog",
        url: "#",
        icon: "Blocks",
        items: Object.keys(resourceTypes).map((resourceType) => ({
          title: resourceTypes[resourceType].kind,
          url: `/catalog/${resourceType}`,
          icon: resourceTypes[resourceType].icon,
        })),
      },
    ];
  }, [resourceTypes]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {platformSideBarItems.map((item) => (
              <SidebarItem
                key={item.title}
                item={item}
                isActive={location.pathname === item.url}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

const SidebarItem = ({ item, isActive }: { item: any; isActive: boolean }) => {
  const location = useLocation();
  // Add state to control the open status
  const [isOpen, setIsOpen] = useState(false);

  const isAnySubItemActive = useMemo(
    () => item.items?.some((subItem: any) => location.pathname === subItem.url),
    [item.items, location.pathname],
  );

  useEffect(() => {
    setIsOpen(isAnySubItemActive);
  }, [isAnySubItemActive]);

  if (!item.items) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <Link
            to={item.url as any}
            className={isActive ? "bg-sidebar-accent" : ""}
          >
            {item.icon && getLucideIcon(item.icon)({})}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      key={item.title}
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={isActive ? "bg-sidebar-accent" : ""}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
          >
            {item.icon && getLucideIcon(item.icon)({})}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <SidebarMenuSub>
            {item.items?.map((subItem: any) => {
              const isSubItemActive = location.pathname === subItem.url;
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild>
                    <Link
                      to={subItem.url as any}
                      className={isSubItemActive ? "bg-sidebar-accent" : ""}
                    >
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};
