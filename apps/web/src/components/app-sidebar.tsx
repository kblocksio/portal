import { useMemo } from "react";

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

const platformSidebarNavData = [
  {
    title: "Home",
    url: "/",
    icon: "Home",
    isActive: true,
  },
  {
    title: "Catalog",
    url: "#",
    icon: "Blocks",
    items: [],
  },
  {
    title: "Documentation",
    url: "#",
    icon: "BookOpen",
    items: [
      {
        title: "Introduction",
        url: "#",
      },
      {
        title: "Get Started",
        url: "#",
      },
      {
        title: "Tutorials",
        url: "#",
      },
      {
        title: "Changelog",
        url: "#",
      },
    ],
  },
];

export const AppSidebar = () => {
  const { projects } = useAppContext();
  const location = useLocation();

  const sidebarProjects = useMemo(() => {
    return projects.map((project) => ({
      title: project.label,
      url: `/projects/${project.value}`,
      icon: project.icon,
    }));
  }, [projects]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {platformSidebarNavData.map((item) => (
              <SidebarItem
                key={item.title}
                item={item}
                isActive={location.pathname === item.url}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>My Projects</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarProjects.map((item) => (
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
      asChild
      defaultOpen={item.isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={isActive ? "active" : ""}
          >
            {item.icon && getLucideIcon(item.icon)({})}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem: any) => {
              const isSubItemActive = location.pathname === subItem.url;
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild>
                    <a
                      href={subItem.url}
                      className={isSubItemActive ? "active" : ""}
                    >
                      <span>{subItem.title}</span>
                    </a>
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
