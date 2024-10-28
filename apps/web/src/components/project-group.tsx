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
import { useContext, useEffect, useMemo } from "react";
import { Resource, ResourceType } from "~/resource-context";
import { cn, getResourceOutputs } from "~/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getResourceIconColors } from "~/lib/hero-icon";
import { useNavigate } from "@tanstack/react-router";
import { useProjectColumns } from "./projects";
import { DataTableColumnHeader } from "./data-table-column-header";

export function ProjectGroup(props: {
  objType: string;
  resourceType: ResourceType;
  resources: Resource[];
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

  const outputColumns = useMemo<ColumnDef<Resource>[]>(() => {
    if (resources.length === 0) {
      return [];
    }

    const outputs = Object.keys(getResourceOutputs(resources[0]));

    return outputs.map((output) => ({
      accessorKey: output,
      header: (props) => (
        <DataTableColumnHeader column={props.column} title={output} />
      ),
      cell: (props) => (
        <div className="min-w-0">
          <span className="truncate">
            {props.row.original.status?.[output]}
          </span>
        </div>
      ),
    }));
  }, [resources]);

  const columns = useProjectColumns(outputColumns);

  const table = useReactTable({
    data: resources,
    columns,
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

  return table.getRowModel().rows.length > 0 ? (
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
                      header.column.id === "logs"
                        ? "w-[50%] min-w-96"
                        : undefined,
                      header.column.id === "status" ||
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
  const navigate = useNavigate();
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => {
        const resourceDetailsUri = resource.objUri.replace("kblocks://", "");
        navigate({ to: `/resources/${resourceDetailsUri}` });
      }}
    >
      {children}
    </TableRow>
  );
}
