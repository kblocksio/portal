import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
  getFilteredRowModel,
  OnChangeFn,
  ColumnSort,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useContext, useMemo } from "react";
import { Resource, ResourceContext, ResourceType } from "~/ResourceContext";
import { cn } from "~/lib/utils.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table.jsx";
import { getResourceIconColors } from "~/lib/hero-icon.jsx";

export function ProjectGroup(props: {
  objType: string;
  resourceType: ResourceType;
  resources: Resource[];
  columns: ColumnDef<Resource>[];
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  sorting: ColumnSort[];
  onSortingChange: OnChangeFn<ColumnSort[]>;
}) {
  const resources = useMemo(() => {
    return props.resources.filter(
      (resource) => resource.objType === props.objType,
    );
  }, [props.resources, props.objType]);

  const table = useReactTable({
    data: resources,
    columns: props.columns,
    state: {
      columnFilters: props.columnFilters,
      sorting: props.sorting,
    },
    onColumnFiltersChange: props.onColumnFiltersChange,
    onSortingChange: props.onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const Icon = props.resourceType.iconComponent;

  const iconColor = getResourceIconColors({
    // color: resourceType?.color,
    color: undefined,
  });

  return resources.length > 0 ? (
    <section>
      <div className="mb-4 flex items-center">
        <Icon className={`${iconColor} mr-2 h-6 w-6`} />
        <h2 className="text-xl font-semibold">{props.resourceType.plural}</h2>
      </div>
      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      header.column.id === "status" ||
                        header.column.id === "name" ||
                        header.column.id === "kind" ||
                        header.column.id === "system" ||
                        header.column.id === "namespace" ||
                        header.column.id === "lastUpdated" ||
                        header.column.id === "actions"
                        ? "w-0"
                        : undefined,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <ResourceTableRow key={row.id} resource={row.original}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </ResourceTableRow>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={props.columns.length}>
                  <div className="flex h-16 items-center justify-center">
                    <p className="text-muted-foreground">No resources found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  ) : (
    <></>
  );
}

function ResourceTableRow({
  resource,
  children,
}: {
  resource: Resource;
  children: React.ReactNode;
}) {
  const { setSelectedResourceId } = useContext(ResourceContext);
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() =>
        setSelectedResourceId({
          objType: resource.objType,
          objUri: resource.objUri,
        })
      }
    >
      {children}
    </TableRow>
  );
}
