import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  ColumnFiltersState,
  ColumnSort,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useContext, useMemo, useState } from "react";
import { Resource, ResourceContext } from "~/resource-context";
import { DataTableColumnHeader } from "~/components/data-table-column-header";
import { parseBlockUri, StatusReason } from "@kblocks/api";
import { DataTableToolbar } from "~/components/data-table-toolbar";
import { ProjectGroup } from "~/components/project-group";
import { LastUpdated } from "./last-updated";
import { cn, getReadyCondition } from "~/lib/utils";
import { LastLogMessage } from "./last-log-message";
import { StatusBadge } from "./status-badge";
import { SystemBadge } from "./system-badge";
import { NamespaceBadge } from "./namespace-badge";
import { ResourceActionsMenu } from "./resource-actions-menu";
import { TableHead } from "./ui/table";

export const useProjectColumns = (outputColumns?: ColumnDef<Resource>[]) => {
  const { resourceTypes } = useContext(ResourceContext);

  const columns = useMemo<ColumnDef<Resource>[]>(() => {
    return [
      {
        accessorKey: "status",
        header: (props) => (
          <TableHead
            key={props.header.id}
            colSpan={props.header.colSpan}
            className="w-0"
          ></TableHead>
        ),
        cell: (props) => <StatusBadge obj={props.row.original} />,
        filterFn: (row, columnId, filterValue) => {
          const readyCondition = getReadyCondition(row.original);
          const status =
            readyCondition?.reason === StatusReason.Completed
              ? "Ready"
              : readyCondition?.reason === StatusReason.Error
                ? "Failed"
                : undefined;
          return filterValue.includes(status);
        },
        sortingFn: (rowA, rowB) => {
          const readyConditionA = getReadyCondition(rowA.original.obj);
          const readyConditionB = getReadyCondition(rowB.original.obj);

          if (!readyConditionA?.status || !readyConditionB?.status) {
            return 0;
          }

          return readyConditionA.status.localeCompare(readyConditionB.status);
        },
      },
      {
        accessorKey: "name",
        header: (props) => (
          <TableHead key={props.header.id} colSpan={props.header.colSpan}>
            <DataTableColumnHeader column={props.column} title="Name" />
          </TableHead>
        ),
        cell: (props) => (
          <div className="whitespace-nowrap">
            {props.row.original.metadata.name}
          </div>
        ),
        filterFn: (row, columnId, filterValue) => {
          return row.original.metadata.name.includes(filterValue);
        },
        sortingFn: (rowA, rowB) => {
          return rowA.original.metadata.name.localeCompare(
            rowB.original.metadata.name,
          );
        },
      },
      {
        accessorKey: "system",
        header: (props) => (
          <TableHead key={props.header.id} colSpan={props.header.colSpan}>
            <DataTableColumnHeader column={props.column} title="System" />
          </TableHead>
        ),
        cell: (props) => (
          <div className="flex items-center gap-1.5">
            <SystemBadge blockUri={props.row.original.objUri} />
          </div>
        ),
        filterFn: (row, columnId, filterValue) => {
          const { system } = parseBlockUri(row.original.objUri);
          return filterValue.includes(system);
        },
        sortingFn: (rowA, rowB) => {
          const { system: systemA } = parseBlockUri(rowA.original.objUri);
          const { system: systemB } = parseBlockUri(rowB.original.objUri);
          return systemA.localeCompare(systemB);
        },
      },
      {
        accessorKey: "namespace",
        header: (props) => (
          <TableHead key={props.header.id} colSpan={props.header.colSpan}>
            <DataTableColumnHeader column={props.column} title="Namespace" />
          </TableHead>
        ),
        cell: (props) =>
          props.row.original.metadata.namespace && (
            <NamespaceBadge namespace={props.row.original.metadata.namespace} />
          ),
        filterFn: (row, columnId, filterValue) => {
          return filterValue.includes(
            row.original.metadata.namespace ?? "default",
          );
        },
        sortingFn: (rowA, rowB) => {
          const namespaceA = rowA.original.metadata.namespace ?? "default";
          const namespaceB = rowB.original.metadata.namespace ?? "default";
          return namespaceA.localeCompare(namespaceB);
        },
      },
      {
        accessorKey: "lastUpdated",
        header: (props) => (
          <TableHead key={props.header.id} colSpan={props.header.colSpan}>
            <DataTableColumnHeader column={props.column} title="Last Updated" />
          </TableHead>
        ),
        cell: (props) => <LastUpdated resource={props.row.original} />,
        sortingFn: (rowA, rowB) => {
          const readyConditionA = getReadyCondition(rowA.original);
          const readyConditionB = getReadyCondition(rowB.original);
          const lastUpdatedA =
            readyConditionA?.lastTransitionTime ??
            rowA.original.metadata.creationTimestamp;
          const lastUpdatedB =
            readyConditionB?.lastTransitionTime ??
            rowB.original.metadata.creationTimestamp;
          if (!lastUpdatedA || !lastUpdatedB) {
            return 0;
          }
          return lastUpdatedA.localeCompare(lastUpdatedB);
        },
      },
      ...(outputColumns ?? []),
      {
        accessorKey: "logs",
        header: (props) => (
          <TableHead
            key={props.header.id}
            colSpan={props.header.colSpan}
            className="w-[100px]"
          >
            <DataTableColumnHeader column={props.column} title="Logs" />
          </TableHead>
        ),
        cell: (props) => <LastLogMessage objUri={props.row.original.objUri} />,
        enableSorting: false,
      },
      {
        accessorKey: "actions",
        header: (props) => (
          <TableHead
            key={props.header.id}
            colSpan={props.header.colSpan}
            className="w-0"
          ></TableHead>
        ),
        cell: (props) => (
          <ResourceActionsMenu
            resource={props.row.original}
            resourceType={resourceTypes[props.row.original.objType]}
          />
        ),
      },
    ];
  }, [resourceTypes]);

  return columns;
};

export interface ProjectsProps {
  resources: Resource[];
}

export const ProjectPage = (props: ProjectsProps) => {
  const { resourceTypes } = useContext(ResourceContext);

  const columns = useProjectColumns();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<ColumnSort[]>([]);

  const table = useReactTable({
    data: props.resources,
    columns,
    state: {
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const emptyTable = useMemo(
    () => table.getFilteredRowModel().rows.length === 0,
    [table.getFilteredRowModel().rows],
  );

  return (
    <div className="flex flex-col gap-8">
      <DataTableToolbar table={table} />
      {Object.entries(resourceTypes).map(([objType, resourceType], index) => (
        <ProjectGroup
          key={index}
          objType={objType}
          resourceType={resourceType}
          resources={props.resources}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      ))}
      {emptyTable && (
        <div className="flex h-16 items-center justify-center">
          <p className="text-muted-foreground">
            No resources found for selected filters
          </p>
        </div>
      )}
    </div>
  );
};
