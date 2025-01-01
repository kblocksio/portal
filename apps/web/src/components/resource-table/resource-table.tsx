import {
  useReactTable,
  getCoreRowModel,
  ColumnFiltersState,
  ColumnSort,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  RowSelectionState,
  createColumnHelper,
  type TableOptions,
  type Table as ReactTable,
  type TableState,
} from "@tanstack/react-table";
import {
  memo,
  useEffect,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";
import { DataTableColumnHeader } from "./column-header";
import { LastUpdated } from "../last-updated";
import { cn, getResourceOutputs } from "@/lib/utils";
import { LastLogMessage } from "../last-log-message";
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
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { ResourceTableToolbar } from "./resource-table-toolbar";
import { CircleEllipsis } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ResourceActionsMenu } from "../resource-actions-menu";
import { ProjectLink } from "../project-link";
import { Checkbox } from "../ui/checkbox";
import { Link } from "../ui/link";
import type { Resource } from "@kblocks-portal/server";
import { ResourceIcon } from "@/lib/get-icon";
import { StatusBadge } from "../status-badge";
import Outputs from "../outputs";
import { ResourceLink } from "../resource-link";
import { parseBlockUri } from "@kblocks/api";

export const defaultResourceSorting: ColumnSort[] = [
  { id: "kind", desc: false },
];

const columnHelper = createColumnHelper<Resource>();

const useColumns = (options?: {
  enableRowSelection?: TableOptions<Resource>["enableRowSelection"];
}) => {
  return useMemo(() => {
    return [
      ...(options?.enableRowSelection
        ? [
            columnHelper.display({
              id: "selection",
              cell: (props) => (
                <Checkbox
                  checked={props.row.getIsSelected()}
                  disabled={!props.row.getCanSelect()}
                  onCheckedChange={props.row.getToggleSelectedHandler()}
                />
              ),
              size: 0,
              header: (props) => (
                <Checkbox
                  checked={
                    props.table.getIsAllRowsSelected()
                      ? true
                      : props.table.getIsSomeRowsSelected()
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(checked) =>
                    props.table.toggleAllRowsSelected(checked === true)
                  }
                />
              ),
            }),
          ]
        : []),
      columnHelper.display({
        id: "status",
        cell: (props) => (
          <div className="flex items-center gap-1.5">
            <StatusBadge
              conditions={props.row.original.status?.conditions ?? []}
              merge
            />
          </div>
        ),
        size: 0,
        header: () => <></>,
        // filterFn: (row, columnId, filterValue) => {
        //   const readyCondition = getReadyCondition(row.original);
        //   const status =
        //     readyCondition?.reason === StatusReason.Completed
        //       ? "Ready"
        //       : readyCondition?.reason === StatusReason.Error
        //         ? "Failed"
        //         : undefined;
        //   return filterValue.includes(status);
        // },
        // sortingFn: (rowA, rowB) => {
        //   const readyConditionA = getReadyCondition(rowA.original.obj);
        //   const readyConditionB = getReadyCondition(rowB.original.obj);

        //   if (!readyConditionA?.status || !readyConditionB?.status) {
        //     return 0;
        //   }

        //   return readyConditionA.status.localeCompare(readyConditionB.status);
        // },
      }),
      columnHelper.accessor("kind", {
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Kind" />
        ),
        cell: (props) => {
          return (
            <div className="flex items-center gap-1.5">
              <ResourceIcon
                icon={props.row.original.type?.icon}
                className="h-4 w-4"
              />
              {props.getValue()}
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.metadata.name, {
        id: "name",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Name" />
        ),
        cell: (props) => (
          <div className="whitespace-nowrap">
            <Link
              className="font-medium hover:underline"
              to={
                `/resources/${props.row.original.objUri.replace(
                  "kblocks://",
                  "",
                )}` as any
              }
            >
              {props.row.original.metadata?.name}
            </Link>
          </div>
        ),
      }),
      columnHelper.accessor((object) => parseBlockUri(object.objUri).system, {
        id: "cluster",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Cluster" />
        ),
        cell: (props) => <SystemBadge object={props.row.original} />,
      }),
      columnHelper.accessor(
        (object) => parseBlockUri(object.objUri).namespace,
        {
          id: "namespace",
          header: (props) => (
            <DataTableColumnHeader column={props.column} title="Namespace" />
          ),
          cell: (props) => <NamespaceBadge object={props.row.original} />,
        },
      ),
      columnHelper.accessor("relationships", {
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Children" />
        ),
        cell: (props) => {
          const relationships = props.getValue() ?? [];
          const children = relationships
            .filter((relationship) => relationship.type === "child")
            .map((relationship) => relationship.resource);

          if (children.length === 0) {
            return null;
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="h-0">
                    <div>
                      {children.length === 1
                        ? "1 Child"
                        : `${children.length} Children`}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-2">
                    {children.map((resource) => {
                      return (
                        <div key={resource.objUri}>
                          <ResourceLink resource={resource} />
                        </div>
                      );
                    })}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor("projects", {
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Projects" />
        ),
        cell: (props) => {
          // return JSON.stringify(props.row.original.projects);
          const projects = props.getValue() ?? [];
          if (projects.length === 0) {
            return null;
          }

          if (projects.length === 1) {
            return (
              <span className="truncate">
                <ProjectLink project={projects[0]} />
              </span>
            );
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="h-0">
                    {projects.length === 1
                      ? `${projects.length} Project`
                      : `${projects.length} Projects`}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col items-start gap-2">
                    {projects.map((project) => (
                      <ProjectLink key={project.objUri} project={project} />
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        enableSorting: false,
        // filterFn: (row, columnId, selectedProjects) => {
        //   if (selectedProjects.includes("$unassigned")) {
        //     if (row.getValue().length === 0) {
        //       return true;
        //     }
        //   }

        //   for (const p of selectedProjects) {
        //     if (row.original.prjs.find((pp) => pp.metadata.name === p)) {
        //       return true;
        //     }
        //   }

        //   return false;
        // },
        // sortingFn: (rowA, rowB) => {
        //   return JSON.stringify(rowA.original.prjs).localeCompare(
        //     JSON.stringify(rowB.original.prjs),
        //   );
        // },
      }),
      columnHelper.display({
        id: "lastUpdated",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Last Updated" />
        ),
        cell: (props) => {
          const object = props.row.original;

          const readyCondition = object.status?.conditions?.find(
            (c) => c.type === "Ready",
          );

          const lastUpdated =
            readyCondition?.lastTransitionTime ??
            object.metadata?.creationTimestamp;

          const timestamp = lastUpdated ? new Date(lastUpdated) : undefined;

          return timestamp && <LastUpdated timestamp={timestamp.getTime()} />;
        },
      }),
      columnHelper.display({
        id: "logs",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Logs" />
        ),
        size: 400,
        cell: (props) => <LastLogMessage objUri={props.row.original.objUri} />,
        enableSorting: false,
      }),
      columnHelper.display({
        id: "outputs",
        size: 0,
        header: () => <></>,
        cell: (props) => {
          return <ResourceOutputs resource={props.row.original} />;
        },
        enableSorting: false,
      }),
      columnHelper.display({
        id: "actions",
        size: 0,
        header: () => <></>,
        cell: (props) => <ResourceActionsMenu resource={props.row.original} />,
        enableSorting: false,
      }),
    ];
  }, []);
};

export const useResourceTable = (
  options: Omit<TableOptions<Resource>, "columns">,
): ReactTable<Resource> => {
  const columns = useColumns({
    enableRowSelection: options.enableRowSelection ?? false,
  });

  const table = useReactTable({
    ...options,
    columns,
  });

  return table;
};

export interface ResourceTableProps {
  table: ReactTable<Resource>;
  className?: string;
  showActions?: boolean;
  showCreateNew?: boolean;
  customNewResourceAction?: {
    label: string;
    navigate: () => void;
  };
  fetching?: boolean;
}

export const ResourceTable = ({
  table,
  className,
  showActions,
  showCreateNew,
  customNewResourceAction,
}: ResourceTableProps) => {
  const emptyTable =
    table &&
    table.getFilteredRowModel() &&
    table.getFilteredRowModel().rows &&
    table.getFilteredRowModel().rows.length === 0;

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <ResourceTableToolbar
        table={table}
        showActions={showActions}
        showCreateNew={showCreateNew}
        customNewResourceAction={customNewResourceAction}
      />
      <div
        className={cn(
          "relative overflow-x-auto rounded-md border bg-white",
          className,
        )}
      >
        {/* {fetching && (
          <DelayedRender delay={200}>
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Spinner />
            </motion.div>
          </DelayedRender>
        )} */}
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
              <ResourceTableRow
                key={row.original.objUri}
                isSelected={row.getIsSelected()}
              >
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
            No resources found for the selected filters
          </p>
        </div>
      )}
    </div>
  );
};

const ResourceTableRow = memo(function ResourceTableRow({
  isSelected,
  children,
  style,
}: {
  isSelected: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <TableRow data-state={isSelected ? "selected" : undefined} style={style}>
      {children}
    </TableRow>
  );
});

const ResourceOutputs = memo(function ResourceOutputs({
  resource,
}: {
  resource: Resource;
}) {
  const outputs = getResourceOutputs(resource);
  const [isOpen, setIsOpen] = useState(false);

  if (Object.keys(outputs).length === 0 || !resource.type) {
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
              <Outputs outputs={outputs} resource={resource} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

// const DelayedRender: FC<PropsWithChildren<{ delay: number }>> = ({
//   delay,
//   children,
// }) => {
//   const [isRendered, setIsRendered] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsRendered(true);
//     }, delay);

//     return () => clearTimeout(timer);
//   }, [delay]);

//   return isRendered ? <>{children}</> : null;
// };
