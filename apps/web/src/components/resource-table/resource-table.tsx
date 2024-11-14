import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  ColumnFiltersState,
  ColumnSort,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  RowSelectionState,
  Row,
} from "@tanstack/react-table";
import { memo, useContext, useMemo, useState } from "react";
import { Resource, ResourceContext, ResourceType } from "@/resource-context";
import { DataTableColumnHeader } from "./column-header";
import { parseBlockUri, StatusReason } from "@kblocks/api";
import { LastUpdated } from "../last-updated";
import { cn, getReadyCondition, getResourceOutputs } from "@/lib/utils";
import { LastLogMessage } from "../last-log-message";
import { StatusBadge } from "../status-badge";
import { SystemBadge } from "../system-badge";
import { NamespaceBadge } from "../namespace-badge";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocation } from "@tanstack/react-router";
import Outputs from "@/components/outputs";
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
import { ResourceActionsMenu } from "../resource-actions-menu";
import { ResourceLink } from "../resource-link";
import { ProjectLink } from "../project-link";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { Checkbox } from "../ui/checkbox";
import { Link } from "../ui/link";

const defaultSorting: ColumnSort[] = [{ id: "kind", desc: false }];

const useColumns = () => {
  const { resourceTypes, relationships, objects, projects } =
    useContext(ResourceContext);

  return useMemo<ColumnDef<Resource>[]>(() => {
    return [
      {
        accessorKey: "selection",
        cell: (props) => (
          <div className="flex items-center gap-1.5">
            <Checkbox
              onClick={(e) => e.stopPropagation()}
              checked={props.row.getIsSelected()}
              disabled={!props.row.getCanSelect()}
              // indeterminate={props.row.getIsSomeSelected()}
              onCheckedChange={props.row.getToggleSelectedHandler()}
            />
          </div>
        ),
        size: 0,
        header: () => <></>,
      },
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
          <div className="whitespace-nowrap">
            <Link
              className="font-medium hover:underline"
              to={`/resources/${props.row.original.objUri.replace("kblocks://", "")}`}
            >
              {props.row.original.metadata.name}
            </Link>
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
          <DataTableColumnHeader column={props.column} title="Cluster" />
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
        accessorKey: "children",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Children" />
        ),
        cell: (props) => {
          const rels = Object.entries(
            relationships[props.row.original.objUri] ?? {},
          )
            .filter(([, rel]) => rel.type === "child")
            .map(([relUri]) => objects[relUri]);

          if (rels.length === 0) {
            return null;
          }
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="h-0">
                    <div>{rels.length} Children</div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-2">
                    {rels.map((r) => {
                      return (
                        <div key={r.objUri}>
                          <ResourceLink resource={r} />
                        </div>
                      );
                    })}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        accessorKey: "projects",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Projects" />
        ),
        cell: (props) => {
          const prjs = projects.filter((p) =>
            (p.objects ?? []).includes(props.row.original.objUri),
          );

          if (prjs.length === 0) {
            return null;
          }

          if (prjs.length === 1) {
            return (
              <span className="truncate">
                <ProjectLink project={prjs[0]} />
              </span>
            );
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="h-0">
                    {prjs.length} Projects
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col items-start gap-2">
                    {prjs.map((p) => (
                      <ProjectLink key={p.metadata.name} project={p} />
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        filterFn: (row, columnId, selectedProjects) => {
          const prjs = projects.filter((p) =>
            (p.objects ?? []).includes(row.original.objUri),
          );
          if (selectedProjects.includes("$unassigned")) {
            if (prjs.length === 0) {
              return true;
            }
          }

          for (const p of selectedProjects) {
            if (prjs.find((pp) => pp.metadata.name === p)) {
              return true;
            }
          }

          return false;
        },
        sortingFn: (rowA, rowB) => {
          const prjsA = projects.filter((p) =>
            (p.objects ?? []).includes(rowA.original.objUri),
          );
          const prjsB = projects.filter((p) =>
            (p.objects ?? []).includes(rowB.original.objUri),
          );
          return JSON.stringify(prjsA).localeCompare(JSON.stringify(prjsB));
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
          return (
            <ResourceOutputs
              resource={props.row.original}
              resourceType={resourceTypes[props.row.original.objType]}
            />
          );
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
  }, [resourceTypes, objects, relationships, projects]);
};

export const ResourceTable = (props: {
  resources: Resource[];
  className?: string;
  showActions?: boolean;
}) => {
  const columns = useColumns();

  const location = useLocation();

  const [columnFilters, setColumnFilters] = useLocalStorage<ColumnFiltersState>(
    JSON.stringify([location.pathname, "columnFilters"]),
    [],
  );
  const [sorting, setSorting] = useLocalStorage(
    JSON.stringify([location.pathname, "sorting"]),
    defaultSorting,
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data: props.resources,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = useMemo(() => table.getFilteredRowModel().rows, [table]);
  const emptyTable = useMemo(() => rows.length === 0, [rows]);

  return (
    <div className={cn("flex flex-col gap-8", props.className)}>
      <ResourceTableToolbar table={table} showActions={props.showActions} />

      <div className={cn("rounded-md border bg-white", props.className)}>
        <Table className="w-full">
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
              <ResourceTableRow key={row.id} resource={row.original} row={row}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </ResourceTableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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

const ResourceTableRow = memo(
  ({
    resource,
    row,
    children,
  }: {
    resource: Resource;
    row: Row<Resource>;
    children: React.ReactNode;
  }) => {
    return (
      <TableRow
        key={resource.objUri}
        data-state={row.getIsSelected() ? "selected" : undefined}
      >
        {children}
      </TableRow>
    );
  },
);
ResourceTableRow.displayName = "ResourceTableRow";

const ResourceOutputs = ({
  resource,
  resourceType,
}: {
  resource: Resource;
  resourceType: ResourceType;
}) => {
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
                  className="h-0"
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
              <Outputs
                outputs={outputs}
                resourceObjUri={resource.objUri}
                resourceType={resourceType}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
