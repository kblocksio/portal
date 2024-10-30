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
import { Resource, ResourceContext } from "@/resource-context";
import { DataTableColumnHeader } from "./column-header";
import { parseBlockUri, StatusReason } from "@kblocks/api";
import { LastUpdated } from "../last-updated";
import { getReadyCondition, getResourceOutputs } from "@/lib/utils";
import { LastLogMessage } from "../last-log-message";
import { StatusBadge } from "../status-badge";
import { SystemBadge } from "../system-badge";
import { NamespaceBadge } from "../namespace-badge";
import { ResourceActionsMenu } from "../resource-actions-menu";
import { TableHead } from "../ui/table";
import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import { KeyValueList } from "@/routes/resources.$group.$version.$plural.$system.$namespace.$name";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { ResourceTableToolbar } from "./table-toolbar";
import { CircleEllipsis } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useAppContext } from "@/app-context";

const useColumns = () => {
  const { resourceTypes } = useContext(ResourceContext);
  return useMemo<ColumnDef<Resource>[]>(() => {
    return [
      {
        accessorKey: "status",
        cell: (props) => (
          <div className="flex items-center gap-1.5">
            <StatusBadge obj={props.row.original} merge />
          </div>
        ),
        size: 0,
        header: () => <></>,
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
        accessorKey: "kind",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Kind" />
        ),
        cell: (props) => {
          const Icon = resourceTypes[props.row.original.objType]?.iconComponent;
          return (
            <div className="flex items-center gap-1.5">
              {Icon && <Icon className="h-4 w-4" />}
              {props.row.original.kind}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          return row.original.kind.includes(filterValue);
        },
        sortingFn: (rowA, rowB) => {
          return rowA.original.kind.localeCompare(rowB.original.kind);
        },
      },
      {
        accessorKey: "name",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Name" />
        ),
        cell: (props) => (
          <div className="whitespace-nowrap font-medium">
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
        cell: (props) => (
          <div className="flex items-center gap-1.5">
            {props.row.original.metadata.namespace && (
              <NamespaceBadge
                namespace={props.row.original.metadata.namespace}
              />
            )}
          </div>
        ),
        filterFn: (row, columnId, filterValue) => {
          const { namespace } = parseBlockUri(row.original.objUri);
          return filterValue.includes(namespace);
        },
        sortingFn: (rowA, rowB) => {
          const { namespace: namespaceA } = parseBlockUri(rowA.original.objUri);
          const { namespace: namespaceB } = parseBlockUri(rowB.original.objUri);
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
        size: 400,
        cell: (props) => <LastLogMessage objUri={props.row.original.objUri} />,
        // enableSorting: false,
      },
      {
        accessorKey: "outputs",
        size: 0,
        header: () => <></>,
        cell: (props) => {
          return <ResourceOutputs resource={props.row.original} />;
        },
      },
      {
        accessorKey: "actions",
        size: 0,
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
};

export const ResourceTable = (props: { resources: Resource[] }) => {
  const columns = useColumns();
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
      <ResourceTableToolbar table={table} />
      <section>
        <div className="overflow-x-auto rounded-md border bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) =>
                    header.isPlaceholder ? null : (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: header.getSize() }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                    ),
                  )}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <ResourceTableRow key={row.id} resource={row.original}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </ResourceTableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
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

function ResourceTableRow({
  resource,
  children,
}: {
  resource: Resource;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { setBreadcrumbs, selectedProject } = useAppContext();
  return (
    <TableRow
      key={resource.objUri}
      className="cursor-pointer"
      onClick={() => {
        const resourceDetailsUri = resource.objUri.replace("kblocks://", "");
        navigate({ to: `/resources/${resourceDetailsUri}` });
        setBreadcrumbs([
          {
            name: selectedProject?.label || "",
            url: `/projects/${selectedProject?.value}`,
          },
          {
            name: resource.metadata.name,
          },
        ]);
      }}
    >
      {children}
    </TableRow>
  );
}

const ResourceOutputs = ({ resource }: { resource: Resource }) => {
  const outputs = getResourceOutputs(resource);
  const [isOpen, setIsOpen] = useState(false);

  if (Object.keys(outputs).length === 0) {
    return null;
  }

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    setIsOpen(true);
                    e.stopPropagation();
                  }}
                >
                  <CircleEllipsis className="h-4 w-4" />
                  <span className="sr-only">Outputs</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Outputs</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col space-y-8">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <KeyValueList data={outputs} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
