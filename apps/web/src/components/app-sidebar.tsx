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
import { ChevronRight, PlusIcon } from "lucide-react";
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
import { ResourceContext, ResourceType } from "@/resource-context";
import { Button } from "./ui/button";

export const AppSidebar = () => {
  const navigate = useNavigate();
  const { resourceTypes, categories, projects } = useContext(ResourceContext);
  const location = useLocation();
  const platformSideBarItems = useMemo(() => {
    return [
      {
        title: "Home",
        url: "/",
        icon: "heroicon://home-modern",
        isActive: true,
      },
      {
        title: "Clusters",
        url: "/clusters",
        icon: "heroicon://rectangle-group",
      },
      {
        title: "Catalog",
        url: "/catalog",
        icon: "heroicon://magnifying-glass",
      },
      {
        title: "Resources",
        url: "/resources",
        icon: "heroicon://list-bullet",
      },
    ];
  }, []);

  const nonSystemResourceTypes = useMemo(() => {
    if (!resourceTypes) return {};
    return Object.fromEntries(
      Object.entries(resourceTypes).filter(
        ([_, item]) => !item.group.startsWith("kblocks.io"),
      ),
    );
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
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex w-full items-center justify-between">
              <span>Projects</span>
              <Button
                variant="ghost"
                className="self-end p-0 hover:bg-transparent"
                onClick={() =>
                  navigate({
                    to: "/resources/new/$group/$version/$plural",
                    params: {
                      group: "kblocks.io",
                      version: "v1",
                      plural: "projects",
                    },
                  })
                }
              >
                <PlusIcon className="size-2" />
              </Button>
            </div>
          </SidebarGroupLabel>
          <SidebarMenu>
            {projects.map((project) => (
              <SidebarItem
                key={project.metadata.name}
                item={{
                  title: project.title ?? project.metadata.name,
                  url: `/projects/${project.metadata.name}`,
                  icon: project.icon ?? "heroicon://folder",
                }}
                isActive={
                  location.pathname === `/projects/${project.metadata.name}`
                }
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarMenu>
            {Object.keys(categories).map((category) => {
              const items = Object.keys(nonSystemResourceTypes)
                .filter((resourceTypeKey) =>
                    nonSystemResourceTypes[resourceTypeKey].categories?.includes(category),
                )
                .map((resourceTypeKey) => ({
                  title: nonSystemResourceTypes[resourceTypeKey].kind,
                  url: `/catalog/${resourceTypeKey}`,
                  icon: nonSystemResourceTypes[resourceTypeKey].icon,
                }));
              if (items.length === 0) {
                return null;
              }
              return (
                <SidebarItem
                  isActive={false}
                  key={category}
                  item={{
                    title: categories[category].title,
                    url: "#",
                    icon: categories[category].icon,
                    items,
                  }}
                />
              );
            })}
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
  }, [location.pathname, item.url]);

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
