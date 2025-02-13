import { useEffect, useMemo, useState } from "react";
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
import { ResourceIcon } from "@/lib/get-icon";
import { Link } from "./ui/link";
import {
  useLocation,
  useNavigate,
  type ActiveOptions,
} from "@tanstack/react-router";
import { Button } from "./ui/button";
import { trpc } from "@/trpc";
import { Project } from "@kblocks-portal/server";

export const AppSidebar = () => {
  const navigate = useNavigate();
  const { data: projects } = trpc.listProjects.useQuery(undefined, {
    initialData: [],
  });
  const adminSidebarItems = useMemo(() => {
    return [
      {
        title: "Organizations",
        url: "/organizations",
        icon: "heroicon://user-group",
      },
    ];
  }, []);
  const platformSideBarItems = useMemo(() => {
    return [
      {
        title: "Home",
        url: "/",
        icon: "heroicon://home-modern",
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

  const catalogItems = trpc.listCatalogItems.useQuery(undefined, {
    initialData: [],
    select: (data: any) =>
      data.map((item: any) => ({
        title: item.category,
        icon: item.icon,
        items: item.types.map((type: any) => ({
          title: type.kind,
          url: `/catalog/${type.typeUri}`,
          icon: type.icon,
        })),
      })),
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        {/* Platform */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {platformSideBarItems.map((item) => (
              <SidebarItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Projects */}
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
            {projects.map((project: Project) => (
              <SidebarItem
                key={project.metadata.name}
                item={{
                  title: project.title ?? project.metadata.name,
                  url: `/projects/${project.metadata.name}`,
                  icon: project.icon ?? "heroicon://folder",
                }}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Catalog */}
        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarMenu>
            {catalogItems.data?.map((item: Item) => (
              <SidebarItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Admin */}
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarMenu>
            {adminSidebarItems.map((item) => (
              <SidebarItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>
      {!import.meta.env.VITE_SKIP_AUTH && (
        <SidebarFooter>
          <AppSidebarFooter />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
};

interface Item {
  title: string;
  url?: string;
  icon?: string;
  activeOptions?: ActiveOptions;
  items?: Item[];
}

interface SidebarItemProps {
  item: Item;
}

const SidebarItem = ({ item }: SidebarItemProps) => {
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
    () =>
      item.items?.some((subItem: any) => location.pathname === subItem.url) ??
      false,
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
            activeOptions={item.activeOptions}
            activeProps={{ className: "bg-sidebar-accent" }}
          >
            {item.icon && (
              <ResourceIcon
                icon={item.icon}
                className="h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
            )}
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
            onClick={(e) => {
              e.preventDefault();
              if (item.url && item.url !== "#") {
                navigate({ to: item.url });
              }
              setIsOpen(!isOpen);
            }}
          >
            {item.icon && (
              <ResourceIcon
                icon={item.icon}
                className="h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
            )}
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
                return <SidebarItem key={subItem.title} item={subItem} />;
              }

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild>
                    <Link
                      to={subItem.url as any}
                      activeProps={{ className: "bg-sidebar-accent" }}
                    >
                      {subItem.icon && (
                        <ResourceIcon
                          className="h-5 w-5 flex-shrink-0"
                          aria-hidden="true"
                          icon={subItem.icon}
                        />
                      )}
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
