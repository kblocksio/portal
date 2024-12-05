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
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useEffect, useMemo, useRef, useState } from "react";
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
import { ResourceTableToolbar } from "./table-toolbar";
import { CircleEllipsis } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ResourceActionsMenu } from "../resource-actions-menu";
import { ProjectLink } from "../project-link";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { Checkbox } from "../ui/checkbox";
import { Link } from "../ui/link";
import type { TrpcResource } from "@kblocks-portal/server";
import { ResourceIcon } from "@/lib/get-icon";
import { StatusBadge } from "../status-badge";

const defaultSorting: ColumnSort[] = [{ id: "kind", desc: false }];

const columnHelper = createColumnHelper<TrpcResource>();

const useColumns = () => {
  return useMemo(() => {
    return [
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
      columnHelper.accessor("status", {
        cell: (props) => (
          <div className="flex items-center gap-1.5">
            <StatusBadge
              conditions={props.row.original.statusConditions}
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
                icon={props.row.original.icon}
                className="h-4 w-4"
              />
              {props.getValue()}
            </div>
          );
        },
      }),
      columnHelper.accessor("name", {
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
              {props.getValue()}
            </Link>
          </div>
        ),
      }),
      columnHelper.accessor("cluster", {
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Cluster" />
        ),
        cell: (props) => <SystemBadge system={props.getValue()} />,
      }),
      columnHelper.accessor("namespace", {
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Namespace" />
        ),
        cell: (props) => {
          const namespace = props.getValue();
          if (!namespace) {
            return null;
          }
          return <NamespaceBadge namespace={namespace} />;
        },
      }),
      // columnHelper.accessor("children", {
      //   id: "children",
      //   header: (props) => (
      //     <DataTableColumnHeader column={props.column} title="Children" />
      //   ),
      //   cell: (props) => {
      //     if (props.row.original.rels.length === 0) {
      //       return null;
      //     }
      //     return (
      //       <TooltipProvider>
      //         <Tooltip>
      //           <TooltipTrigger asChild>
      //             <Button variant="ghost" className="h-0">
      //               <div>{props.row.original.rels.length} Children</div>
      //             </Button>
      //           </TooltipTrigger>
      //           <TooltipContent>
      //             <div className="flex flex-col gap-2">
      //               {props.row.original.rels.map((r) => {
      //                 return (
      //                   <div key={r.objUri}>
      //                     <ResourceLink resource={r} />
      //                   </div>
      //                 );
      //               })}
      //             </div>
      //           </TooltipContent>
      //         </Tooltip>
      //       </TooltipProvider>
      //     );
      //   },
      // }),
      columnHelper.accessor("projects", {
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Projects" />
        ),
        cell: (props) => {
          const projects = props.getValue();
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
      columnHelper.accessor("lastUpdated", {
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Last Updated" />
        ),
        cell: (props) =>
          props.row.original.lastUpdated && (
            <LastUpdated timestamp={props.row.original.lastUpdated} />
          ),
      }),
      columnHelper.display({
        id: "logs",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="Logs" />
        ),
        size: 400,
        cell: (props) => <LastLogMessage objUri={props.row.original.objUri} />,
        // enableSorting: false,
      }),
      columnHelper.display({
        id: "outputs",
        size: 0,
        header: () => <></>,
        // cell: (props) => {
        //   return (
        //     <ResourceOutputs
        //       resource={props.row.original}
        //       // resourceType={props.row.original.resourceType}
        //     />
        //   );
        // },
      }),
      columnHelper.display({
        id: "actions",
        size: 0,
        header: () => <></>,
        cell: (props) => (
          <ResourceActionsMenu
            resource={props.row.original}
            // resourceType={props.row.original.resourceType}
          />
        ),
      }),
    ];
  }, []);
};

export const ResourceTable = (props: {
  resources: TrpcResource[];
  className?: string;
  showActions?: boolean;
  showCreateNew?: boolean;
  customNewResourceAction?: {
    label: string;
    navigate: () => void;
  };
}) => {
  const { resources } = props;

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
  useEffect(() => {
    setRowSelection({});
  }, [location.pathname]);

  const table = useReactTable({
    data: resources,
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

  const { rows } = table.getRowModel();

  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 40,
    overscan: 40,
  });

  const emptyTable = table.getFilteredRowModel().rows.length === 0;

  return (
    <div className={cn("flex flex-col gap-8", props.className)}>
      <ResourceTableToolbar
        table={table}
        showActions={props.showActions}
        showCreateNew={props.showCreateNew}
        customNewResourceAction={props.customNewResourceAction}
      />
      <div className={cn("rounded-md border bg-white", props.className)}>
        <div
          ref={scrollRef}
          style={{
            overflow: "auto",
            height: "600px",
          }}
        >
          <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
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
                {virtualizer.getVirtualItems().map((virtualRow, index) => {
                  const row = rows[virtualRow.index];
                  return (
                    <ResourceTableRow
                      key={row.id}
                      isSelected={row.getIsSelected()}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${
                          virtualRow.start - index * virtualRow.size
                        }px)`,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </ResourceTableRow>
                  );
                })}
                {/* {table.getRowModel().rows.map((row) => (
                  <ResourceTableRow
                    key={row.id}
                    resource={row.original}
                    row={row}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </ResourceTableRow>
                ))} */}
              </TableBody>
            </Table>
          </div>
        </div>
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

const ResourceTableRow = memo(
  ({
    isSelected,
    children,
    style,
  }: {
    isSelected: boolean;
    children: React.ReactNode;
    style: React.CSSProperties;
  }) => {
    return (
      <TableRow data-state={isSelected ? "selected" : undefined} style={style}>
        {children}
      </TableRow>
    );
  },
);
ResourceTableRow.displayName = "ResourceTableRow";

const ResourceOutputs = memo(function ResourceOutputs({
  resource,
  // resourceType,
}: {
  resource: TrpcResource;
  // resourceType: ResourceType;
}) {
  const outputs = getResourceOutputs(resource.raw);
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
              {/* <Outputs
                outputs={outputs}
                resourceObjUri={resource.objUri}
                resourceType={resourceType}
              /> */}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});
