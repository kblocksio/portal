"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { useContext } from "react"
import { ResourceContext } from "~/ResourceContext"
import { getIconComponent } from "~/lib/hero-icon"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const { systems, resourceTypes, namespaces } = useContext(ResourceContext);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter resources..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
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
        {table.getColumn("kind") && (
          <DataTableFacetedFilter
            column={table.getColumn("kind")}
            title="Kind"
            options={Object.values(resourceTypes).map(resourceType => ({
              label: resourceType.kind,
              value: resourceType.kind,
              icon: getIconComponent({ icon: resourceType.icon }),
            }))}
          />
        )}

        {table.getColumn("system") && (
          <DataTableFacetedFilter
            column={table.getColumn("system")}
            title="System"
            options={systems.map(system => ({
              label: system,
              value: system,
            }))}
          />
        )}

        {table.getColumn("namespace") && (
          <DataTableFacetedFilter
            column={table.getColumn("namespace")}
            title="Namespace"
            options={namespaces.map(namespace => ({
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
      <DataTableViewOptions table={table} />
    </div>
  )
}
