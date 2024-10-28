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
import { getIconComponent } from "~/lib/hero-icon";
import { DataTableColumnHeader } from "~/components/data-table-column-header";
import { parseBlockUri, StatusReason } from "@kblocks/api";
import { DataTableToolbar } from "~/components/data-table-toolbar";
import { ProjectGroup } from "~/components/project-group";
import { LastUpdated } from "./last-updated";
import { getReadyCondition } from "~/lib/utils";
import { LastLogMessage } from "./last-log-message";
import { StatusBadge } from "./status-badge";
import { SystemBadge } from "./system-badge";
import { NamespaceBadge } from "./namespace-badge";
import { ResourceActionsMenu } from "./resource-actions-menu";

export interface ProjectsProps {
  resources: Resource[];
}

export const Projects = (props: ProjectsProps) => {
  const { resourceTypes } = useContext(ResourceContext);

  const columns = useMemo<ColumnDef<Resource>[]>(() => {
    return [
      {
        accessorKey: "status",
        header: () => <></>,
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
          <DataTableColumnHeader column={props.column} title="Name" />
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
      // {
      //   accessorKey: "kind",
      //   header: (props) => (
      //     <DataTableColumnHeader column={props.column} title="Kind" />
      //   ),
      //   cell: (props) => {
      //     const resourceType = resourceTypes[props.row.original.objType];
      //     const Icon = getIconComponent({
      //       icon: resourceType.icon,
      //     });
      //     return (
      //       <div className="flex items-center gap-1.5">
      //         <Icon className="h-4 w-4" />
      //         {props.row.original.kind}
      //       </div>
      //     );
      //   },
      //   filterFn: (row, columnId, filterValue) => {
      //     return filterValue.includes(row.original.kind);
      //   },
      //   sortingFn: (rowA, rowB) => {
      //     return rowA.original.kind.localeCompare(rowB.original.kind);
      //   },
      // },
      {
        accessorKey: "system",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="System" />
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
          <DataTableColumnHeader column={props.column} title="Namespace" />
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
          <DataTableColumnHeader column={props.column} title="Last Updated" />
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
      {
        accessorKey: "logs",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Logs" />
        ),
        cell: (props) => <LastLogMessage objUri={props.row.original.objUri} />,
        enableSorting: false,
      },
      {
        accessorKey: "actions",
        header: () => <></>,
        cell: (props) => (
          <ResourceActionsMenu
            resource={props.row.original}
            resourceType={resourceTypes[props.row.original.objType]}
          />
        ),
      },
    ];
  }, [resourceTypes]);

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
          columns={columns}
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
