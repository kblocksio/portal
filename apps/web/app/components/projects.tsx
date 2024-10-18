import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useContext, useMemo, useState } from "react";
import { Resource, ResourceContext } from "~/ResourceContext";
import {
  NamespaceBadge,
  ResourceActionsMenu,
  StatusBadge,
  SystemBadge,
} from "~/components/resource-row.jsx";
import { getIconComponent } from "~/lib/hero-icon.jsx";
import { DataTableColumnHeader } from "~/components/data-table-column-header.jsx";
import { parseBlockUri } from "@kblocks/api";
import { DataTableToolbar } from "~/components/data-table-toolbar";
import { ProjectGroup } from "~/components/project-group";
import { LastUpdated } from "./last-updated";
import { getReadyCondition } from "~/lib/utils";

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
          return filterValue.includes(readyCondition?.status);
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
      },
      {
        accessorKey: "kind",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Kind" />
        ),
        cell: (props) => {
          const resourceType = resourceTypes[props.row.original.objType];
          const Icon = getIconComponent({
            icon: resourceType.icon,
          });
          return (
            <div className="flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              {props.row.original.kind}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          return filterValue.includes(row.original.kind);
        },
      },
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
            row.original.obj.metadata.namespace ?? "default",
          );
        },
      },
      {
        accessorKey: "lastUpdated",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Last Updated" />
        ),
        cell: (props) => <LastUpdated resource={props.row.original} />,
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

  const table = useReactTable({
    data: props.resources,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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
        />
      ))}
    </div>
  );
};
