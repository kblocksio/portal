import {
  type Table as TanstackTable,
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  Column,
  ColumnFiltersState,
  getFilteredRowModel,
  OnChangeFn,
} from "@tanstack/react-table";
import { useAppContext } from "~/AppContext";
import { useContext, useMemo, useState } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { Resource, ResourceContext, ResourceType } from "~/ResourceContext";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { ProjectHeader } from "~/components/project-header";
import { Input } from "~/components/ui/input";
import { useCreateResourceWizard } from "~/CreateResourceWizardContext";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils.js";
import {
  NamespaceBadge,
  ResourceActionsMenu,
  SystemBadge,
} from "~/components/resource-row.jsx";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table.jsx";
import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon.jsx";
import { DataTableColumnHeader } from "~/components/data-table-column-header.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover.jsx";
import { Cross2Icon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Separator } from "~/components/ui/separator.jsx";
import { Badge } from "~/components/ui/badge.jsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command.jsx";
import { parseBlockUri } from "@kblocks/api";

export default function _index() {
  const { selectedProject } = useAppContext();

  const { isLoading, resourceTypes, resources } = useContext(ResourceContext);

  const allResources = useMemo(() => {
    return [...resources.values()]
      .flatMap((resources) => [...resources.values()])
      .filter((resource) => resource.kind !== "Block");
  }, [resources]);

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex h-full w-full flex-col overflow-auto py-12 sm:px-6 lg:px-8">
        <ProjectHeader selectedProject={selectedProject} />
        <div className={"container mx-auto"}>
          {isLoading ||
          !resourceTypes ||
          Object.keys(resourceTypes).length === 0 ? (
            <LoadingSkeleton />
          ) : (
            <>
              <Projects resources={allResources} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const LoadingSkeleton = () => {
  return [...Array(3)].map((_, index) => (
    <div key={index} className="w-full space-y-4 p-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  ));
};

interface ProjectsProps {
  resources: Resource[];
}

const Projects = (props: ProjectsProps) => {
  const { resourceTypes } = useContext(ResourceContext);

  const columns = useMemo<ColumnDef<Resource>[]>(() => {
    return [
      {
        accessorKey: "status",
        header: () => <></>,
        cell: (props) => <StatusBadge obj={props.row.original} />,
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

function ProjectGroup(props: {
  objType: string;
  resourceType: ResourceType;
  resources: Resource[];
  columns: ColumnDef<Resource>[];
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
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
    },
    onColumnFiltersChange: props.onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
                        header.column.id === "actions"
                        ? "w-0"
                        : undefined,
                    )}
                    // className="w-0"
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

function StatusBadge({
  obj,
  className,
}: {
  obj: Resource;
  className?: string;
}) {
  const readyCondition = obj?.status?.conditions?.find(
    (condition: any) => condition.type === "Ready",
  );

  const color = readyCondition
    ? readyCondition.status === "True"
      ? "green"
      : readyCondition.message === "In Progress"
        ? "yellow"
        : "red"
    : "yellow";

  return (
    <div
      className={cn(
        "ml-1.5",
        "inline-block rounded-full",
        "h-3 w-3",
        `bg-${color}-500`,
        className,
        "transition-transform duration-200 hover:scale-125",
      )}
    />
  );
}

function LastUpdated({ resource }: { resource: Resource }) {
  const readyCondition = useMemo(
    () =>
      resource.status?.conditions?.find(
        (condition: any) => condition.type === "Ready",
      ),
    [resource],
  );

  const lastUpdated = useMemo(
    () =>
      readyCondition?.lastTransitionTime ?? resource.metadata.creationTimestamp,
    [readyCondition, resource],
  );

  const relativeTime = useMemo(
    () =>
      lastUpdated
        ? formatDistanceToNow(lastUpdated, { addSuffix: true })
        : undefined,
    [lastUpdated],
  );

  if (!lastUpdated) return <></>;

  return (
    <div className="text-muted-foreground text-xs">
      <p className="flex items-center">
        <CalendarIcon className="mr-1 h-3 w-3" />
        Updated {relativeTime}
      </p>
    </div>
  );
}

function ResourceTableRow({
  resource,
  children,
}: {
  resource: Resource;
  children: React.ReactNode;
}) {
  const { openWizard: openEditWizard } = useCreateResourceWizard();
  const { resourceTypes } = useContext(ResourceContext);
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() =>
        openEditWizard({
          resource,
          resourceType: resourceTypes[resource.objType],
        })
      }
    >
      {children}
    </TableRow>
  );
}

interface DataTableToolbarProps<TData> {
  table: TanstackTable<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const { systems, namespaces, resourceTypes } = useContext(ResourceContext);
  const { openWizard: openCreateWizard } = useCreateResourceWizard();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter resources..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={[
              {
                label: "Ready",
                value: "Ready",
                icon: getIconComponent({ icon: "CheckCircle" }),
              },
              {
                label: "Failed",
                value: "Failed",
                icon: getIconComponent({ icon: "XCircle" }),
              },
            ]}
          />
        )}
        {table.getColumn("kind") && (
          <DataTableFacetedFilter
            column={table.getColumn("kind")}
            title="Kind"
            options={Object.values(resourceTypes).map((resourceType) => ({
              label: resourceType.kind,
              value: resourceType.kind,
              icon: getIconComponent({ icon: resourceType.icon }),
            }))}
          />
        )}

        {table.getColumn("system") && (
          <DataTableFacetedFilter
            column={table.getColumn("system")}
            title="System"
            options={systems.map((system) => ({
              label: system,
              value: system,
            }))}
          />
        )}

        {table.getColumn("namespace") && (
          <DataTableFacetedFilter
            column={table.getColumn("namespace")}
            title="Namespace"
            options={namespaces.map((namespace) => ({
              label: namespace,
              value: namespace,
            }))}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}

        <div className="grow"></div>

        <Button size="sm" onClick={() => openCreateWizard()}>
          New Resource...
        </Button>
      </div>
      {/* <DataTableViewOptions table={table} /> */}
    </div>
  );
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined,
                      );
                    }}
                  >
                    <div
                      className={cn(
                        "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
