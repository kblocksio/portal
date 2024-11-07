import { type Table as TanstackTable } from "@tanstack/react-table";
import { useContext } from "react";
import { ResourceContext } from "@/resource-context";
import { Input } from "@/components/ui/input";
import { useCreateResourceWizard } from "@/create-resource-wizard-context";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { DataTableFacetedFilter } from "./faceted-filter";
import { getIconComponent } from "@/lib/get-icon";
import { ScrollArea } from "../ui/scroll-area";
export interface ResourceTableToolbarProps<TData> {
  table: TanstackTable<TData>;
  showActions?: boolean;
}

export function ResourceTableToolbar<TData>({
  table,
  showActions = true,
}: ResourceTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const { systems, namespaces, kinds } = useContext(ResourceContext);
  const { openWizard: openCreateWizard } = useCreateResourceWizard();

  const newResourceButton = (
    <Button size="sm" onClick={() => openCreateWizard()}>
      New Resource...
    </Button>
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
      <div className="w-1/2 sm:grow">
        <Input
          placeholder="Filter resources..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8"
        />
      </div>

      {showActions && <div className="sm:hidden">{newResourceButton}</div>}

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
        <div className="hidden sm:block">
          <Button size="sm" onClick={() => openCreateWizard()}>
            New Resource...
          </Button>
        </div>
      )}
    </div>
  );
}
