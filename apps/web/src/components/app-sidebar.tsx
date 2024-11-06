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
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AppSidebarFooter } from "./app-sidebar-footer";
import { AppSidebarHeader } from "./app-sidebar-header";
import { getIconComponent } from "@/lib/get-icon";
import { Link } from "./ui/link";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ResourceContext } from "@/resource-context";

export const AppSidebar = () => {
  const { resourceTypes, categories } = useContext(ResourceContext);
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
        title: "Catalog",
        url: "/catalog",
        icon: "Blocks",
        items: Object.keys(categories).map((category) => ({
          title: categories[category].title,
          url: "#",
          items: Object.keys(resourceTypes)
            .filter((resourceTypeKey) =>
              resourceTypes[resourceTypeKey].categories?.includes(category),
            )
            .map((resourceTypeKey) => ({
              title: resourceTypes[resourceTypeKey].kind,
              url: `/catalog/${resourceTypeKey}`,
              icon: resourceTypes[resourceTypeKey].icon,
            })),
        })),
      },
      {
        title: "Resources",
        url: "/resources",
        icon: "LayoutDashboard",
      },

    ];
  }, [resourceTypes, categories]);

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
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (
      location.pathname &&
      item.url &&
      item.url !== "#" &&
      !location.pathname.includes(item.url)
    ) {
      setIsOpen(false);
    }
  }, [location.pathname]);

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
            {item.icon &&
              (() => {
                const Icon = getIconComponent({ icon: item.icon });
                return (
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                );
              })()}
            <span title={item.title}>{item.title}</span>
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
            className={isActive ? "bg-sidebar-accent" : ""}
            onClick={(e) => {
              e.preventDefault();
              if (item.url && item.url !== "#") {
                navigate({ to: item.url });
              }
              setIsOpen(!isOpen);
            }}
          >
            {item.icon &&
              (() => {
                const Icon = getIconComponent({ icon: item.icon });
                return (
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                );
              })()}
            <span title={item.title}>{item.title}</span>
            <ChevronRight
              className={`ml-auto transition-transform duration-300 ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <SidebarMenuSub>
            {item.items?.map((subItem: any) => {
              if (subItem.items) {
                return (
                  <SidebarItem
                    key={subItem.title}
                    item={subItem}
                    isActive={location.pathname === subItem.url}
                  />
                );
              }

              const isSubItemActive = location.pathname === subItem.url;
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild>
                    <Link
                      to={subItem.url as any}
                      className={isSubItemActive ? "bg-sidebar-accent" : ""}
                    >
                      {subItem.icon &&
                        (() => {
                          const Icon = getIconComponent({ icon: subItem.icon });
                          return (
                            <Icon
                              className="h-5 w-5 flex-shrink-0"
                              aria-hidden="true"
                            />
                          );
                        })()}
                      <span title={subItem.title}>{subItem.title}</span>
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
