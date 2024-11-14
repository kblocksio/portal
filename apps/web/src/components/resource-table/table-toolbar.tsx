import { type Table as TanstackTable } from "@tanstack/react-table";
import { useContext, useState } from "react";
import { Resource, ResourceContext } from "@/resource-context";
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
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { DeleteResourceDialog } from "../delete-resource";

export interface ResourceTableToolbarProps {
  table: TanstackTable<Resource>;
  showActions?: boolean;
}

export function ResourceTableToolbar({
  table,
  showActions = true,
}: ResourceTableToolbarProps) {
  const navigate = useNavigate();
  const isFiltered = table.getState().columnFilters.length > 0;

  const { systems, namespaces, kinds, projects } = useContext(ResourceContext);

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
          />
        </div>

        {showActions && (
          <div className="md:hidden">
            <Button
              size="sm"
              onClick={() => navigate({ to: "/resources/new" })}
            >
              New Resource
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="w-full" orientation="horizontal">
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

          {table.getColumn("system") && (
            <DataTableFacetedFilter
              column={table.getColumn("system")}
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
      </ScrollArea>

      {showActions && (
        <div className="hidden items-center gap-2 md:flex">
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
              <DropdownMenuItem
                onSelect={() => {
                  setIsDeleteOpen(true);
                }}
              >
                Delete...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={() => navigate({ to: "/resources/new" })}>
            New Resource
          </Button>
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
}
