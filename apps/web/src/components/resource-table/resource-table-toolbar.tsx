import { type Table as TanstackTable } from "@tanstack/react-table";
import { memo, useContext, useState } from "react";
import { ResourceContext } from "@/resource-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { DataTableFacetedFilter } from "./faceted-filter";
import { getIconComponent } from "@/lib/get-icon";
import { useNavigate } from "@tanstack/react-router";

import { ScrollArea } from "../ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { DeleteResourceDialog } from "../delete-resource";
import { ProjectsMenu } from "../projects-menu";
import type { ExtendedApiObject } from "@kblocks-portal/server";

export interface ResourceTableToolbarProps {
  table: TanstackTable<ExtendedApiObject>;
  showActions?: boolean;
  showCreateNew?: boolean;
  customNewResourceAction?: {
    label: string;
    navigate: () => void;
  };
}

export const ResourceTableToolbar = ({
  table,
  showActions = true,
  showCreateNew = true,
  customNewResourceAction,
}: ResourceTableToolbarProps) => {
  const navigate = useNavigate();
  // const isFiltered = table.getState().columnFilters.length > 0;

  // const { systems, namespaces, kinds, projects } = useContext(ResourceContext);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
      <div className="flex grow items-center gap-2 sm:w-64">
        <div className="grow">
          <Input
            placeholder="Filter resources..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-8"
            // TODO: Add back when the backend supports filtering.
            disabled
          />
        </div>

        {showCreateNew && (
          <div className="md:hidden">
            <Button
              size="sm"
              onClick={() => {
                if (customNewResourceAction) {
                  customNewResourceAction.navigate();
                } else {
                  navigate({ to: "/resources/new" });
                }
              }}
            >
              {customNewResourceAction?.label ?? "New Resource"}
            </Button>
          </div>
        )}
      </div>

      {/* TODO: Add back when the backend supports filtering */}

      {/* <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex items-center gap-2">
          {table.getColumn("kind") && (
            <DataTableFacetedFilter
              column={table.getColumn("kind")}
              title="Kind"
              options={kinds.map((kind) => ({
                label: kind,
                value: kind,
              }))}
            />
          )}

          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={[
                {
                  label: "Ready",
                  value: "Ready",
                  icon: getIconComponent({ icon: "CheckCircle" }),
                },
                {
                  label: "Failed",
                  value: "Failed",
                  icon: getIconComponent({ icon: "XCircle" }),
                },
              ]}
            />
          )}

          {table.getColumn("cluster") && (
            <DataTableFacetedFilter
              column={table.getColumn("cluster")}
              title="Cluster"
              options={systems.map((system) => ({
                label: system,
                value: system,
              }))}
            />
          )}

          {table.getColumn("namespace") && (
            <DataTableFacetedFilter
              column={table.getColumn("namespace")}
              title="Namespace"
              options={namespaces.map((namespace) => ({
                label: namespace,
                value: namespace,
              }))}
            />
          )}

          {table.getColumn("projects") && (
            <DataTableFacetedFilter
              column={table.getColumn("projects")}
              title="Projects"
              options={[
                { metadata: { name: "$unassigned" }, title: "(unassigned)" },
                ...projects,
              ].map((project) => ({
                label: project.title ?? project.metadata.name,
                value: project.metadata.name,
              }))}
            />
          )}

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </ScrollArea> */}

      {(showActions || showCreateNew) && (
        <div className="hidden items-center gap-2 md:flex">
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    table.getIsSomeRowsSelected() === false &&
                    table.getIsAllRowsSelected() === false
                  }
                >
                  Actions
                  <ChevronDown className="-mr-1.5 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <ProjectsMenu
                  objUris={table
                    .getSelectedRowModel()
                    .rows.map((row) => row.original.objUri)}
                />

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={() => {
                    setIsDeleteOpen(true);
                  }}
                >
                  <span className="text-destructive">Delete...</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showCreateNew && (
            <Button
              size="sm"
              onClick={() => {
                if (customNewResourceAction) {
                  customNewResourceAction.navigate();
                } else {
                  navigate({
                    to: "/resources/new",
                  });
                }
              }}
            >
              {customNewResourceAction?.label ?? "New Resource"}
            </Button>
          )}
        </div>
      )}

      <DeleteResourceDialog
        resources={table.getSelectedRowModel().rows.map((row) => row.original)}
        isOpen={isDeleteOpen}
        onDeleteClick={() => {
          setIsDeleteOpen(false);
          table.resetRowSelection();
        }}
        onClose={() => {
          setIsDeleteOpen(false);
        }}
      />
    </div>
  );
};
