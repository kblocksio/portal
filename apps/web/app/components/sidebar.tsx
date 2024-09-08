import * as React from "react";
import { AlertTriangle, ChevronDown, ChevronRight, Loader } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import apiGroups from "./api-groups.json";
import { ApiGroup } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useIcon } from "~/hooks/use-icon";
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { useFetch } from "~/hooks/use-fetch";

type MenuItem = {
  icon?: React.ElementType;
  label: string;
  loading?: boolean;
  href?: string;
  isLoading?: boolean;
  children?: MenuItem[];
  error?: Error;
};

function Indicator({ isOpen, item }: { isOpen: boolean; item: MenuItem }) {
  if (item.error) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </TooltipTrigger>
          <TooltipContent>{item.error.message}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!isOpen) {
    return <ChevronRight className="h-4 w-4" />;
  }

  if (item.isLoading) {
    return <Loader className="h-4 w-4 animate-spin" />;
  }

  return <ChevronDown className="h-4 w-4" />;
}

function MenuItem({ item, level = 0 }: { item: MenuItem; level?: number }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { pathname } = useLocation();

  if (item.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-1 hover:bg-accent rounded-md">
          <div className="flex items-center space-x-2">
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </div>
          <Indicator isOpen={isOpen} item={item} />
        </CollapsibleTrigger>
        {item.children.length ? (
          <CollapsibleContent>
            <div
              className={cn(
                "pl-4",
                level === 0 ? "border-l border-border ml-2 mt-1" : "",
              )}
            >
              {item.children.map((child, index) => (
                <MenuItem key={index} item={child} level={level + 1} />
              ))}
            </div>
          </CollapsibleContent>
        ) : (
          <></>
        )}
      </Collapsible>
    );
  }

  const isActive = pathname === item.href;

  return (
    <Link
      to={item.href ?? "/"}
      className={cn(
        "flex items-center p-1 rounded-md",
        isActive ? "bg-primary" : "",
        isActive ? "hover:bg-primary-hover" : "hover:bg-accent",
      )}
    >
      <div className="flex items-center w-full">
        {item.icon && (
          <item.icon
            className={cn(
              "h-4 w-4 flex-shrink-0 mr-2",
              isActive ? "text-primary-foreground" : "text-foreground",
            )}
          />
        )}
        <span
          className={cn(
            "flex-grow truncate",
            isActive ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {item.label}
        </span>
        {item.loading && (
          <Loader className="h-4 w-4 animate-spin flex-shrink-0 ml-2" />
        )}
      </div>
    </Link>
  );
}

function SidebarSection({ api }: { api: ApiGroup }) {
  const { data } = useFetch(`/api`, {
    params: { group: api.group, version: api.version, plural: api.plural },
  });
  const [map, setMap] = useState<Record<string, any>>();

  useEffect(() => {
    if (!data) return; // Only run when data is available

    const myMap: Record<string, any> = {};

    data?.items.forEach((item: any) => {
      myMap[`${item.metadata.namespace}/${item.metadata.name}`] = item;
    });

    setMap(myMap);
  }, [data]);

  const Icon = useIcon(api.icon);
  const children: MenuItem[] = useMemo(() => {
    return Object.values(map ?? {}).map((item: any) => ({
      icon: Icon,
      label: item.metadata.name,
      href: `/${api.group}/${api.version}/${api.plural}/${item.metadata.namespace ?? "default"}/${item.metadata.name}`,
    }));
  }, [map, Icon]);

  return (
    <MenuItem
      item={{
        label: api.plural,
        icon: Icon,
        children,
        isLoading: false, //fix
        error: undefined, //fix
      }}
    />
  );
}

export function Sidebar() {
  return (
    <nav>
      {apiGroups.map((api, index) => (
        <SidebarSection key={index} api={api} />
      ))}
    </nav>
  );
}
