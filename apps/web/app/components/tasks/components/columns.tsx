"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { LastUpdated } from "~/components/resource-row"
import { getIconComponent } from "~/lib/hero-icon"
import { Resource } from "~/ResourceContext"
import { ResourceType } from "@repo/shared"
import { LastLogMessage } from "~/components/last-log-message"
import { parseBlockUri } from "@kblocks/api"
import { getReadyCondition } from "~/lib/utils"
import { NamespaceBadge, StatusBadge, SystemBadge } from "~/components/badges"

type Column = ColumnDef<{ obj: Resource; type: ResourceType }>;

export function columnsForType(resourceType: ResourceType): Column[] {
  const schema = resourceType.schema ?? {};
  const outputs = Object.keys(schema.properties?.status?.properties ?? {}).filter((key) => key !== "conditions");

  const columns = new Array<Column>();

  columns.push({
    accessorKey: "status",
    header: () => <></>,
    size: 30,
    minSize: 30,
    maxSize: 30,
    cell: ({ row }) => {
      return (
        <div className="pl-1">
          <StatusBadge obj={row.original.obj} />
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const readyConditionA = getReadyCondition(rowA.original.obj);
      const readyConditionB = getReadyCondition(rowB.original.obj);

      if (!readyConditionA?.status || !readyConditionB?.status) {
        return 0;
      }

      return readyConditionA.status.localeCompare(readyConditionB.status);
    },
    filterFn: (row, columnId, filterValue) => {
      const readyCondition = getReadyCondition(row.original.obj);
      return filterValue.includes(readyCondition?.status);
    },
  });

  columns.push({
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" className="flex-grow-0" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="truncate font-extrabold">
            {row.original.obj.metadata.name}
          </span>
          
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.obj.metadata.name.localeCompare(rowB.original.obj.metadata.name);
    },
    filterFn: (row, columnId, filterValue) => {
      return row.original.obj.metadata.name.includes(filterValue);
    },
  });

  columns.push({
    accessorKey: "kind",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kind" />
    ),
    size: 70,
    minSize: 70,
    maxSize: 70,
    cell: ({ row }) => {
      const Icon = getIconComponent({ icon: row.original.type?.icon });
      return (
        <div className="flex items-center">
          <Icon className="mr-2 h-4 w-4" />
          {row.original.type?.kind}
        </div>
      )
    },
    filterFn: (row, columnId, filterValue) => {
      return filterValue.includes(row.original.type?.kind);
    },
    sortingFn: (rowA, rowB) => {
      if (!rowA.original.type || !rowB.original.type) {
        return 0;
      }

      return rowA.original.type?.kind.localeCompare(rowB.original.type?.kind);
    },
  });

  columns.push({
    accessorKey: "system",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="System" />
    ),
    maxSize: 60,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="truncate font-medium">
            <SystemBadge blockUri={row.original.obj.objUri} />
          </span>
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const { system: systemA } = parseBlockUri(rowA.original.obj.objUri);
      const { system: systemB } = parseBlockUri(rowB.original.obj.objUri);
      return systemA.localeCompare(systemB);
    },
    filterFn: (row, columnId, filterValue) => {
      const { system } = parseBlockUri(row.original.obj.objUri);
      return filterValue.includes(system);
    },
  });

  columns.push({
    accessorKey: "namespace",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Namespace" />
    ),
    maxSize: 80,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <NamespaceBadge namespace={row.original.obj.metadata.namespace ?? "default"} />
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      return filterValue.includes(row.original.obj.metadata.namespace ?? "default");
    },
  });


  for (const output of outputs) {
    columns.push({
      accessorKey: output,
      maxSize: 300,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={output} />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-mono font-thin text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
            {row.original.obj.status?.[output]}
          </div>
        )
      },
    });
  }

  columns.push({
    accessorKey: "lastUpdated",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      return (<LastUpdated obj={row.original.obj} />)
    },
  });

  columns.push({
    id: "logs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Logs" />
    ),
    cell: ({ row }) => {
      return (
        <LastLogMessage objUri={row.original.obj.objUri} />
      )
    },
  });



  columns.push({
    id: "actions",
    cell: ({ row }) => {
      return (
        <DataTableRowActions
          resource={row.original.obj}
          resourceType={row.original.type}
        />
      );
    },
  });

  return columns;
}
