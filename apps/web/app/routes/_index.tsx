import { useAppContext } from "~/AppContext";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { Resource, ResourceContext } from "~/ResourceContext";
import { CalendarIcon, Search } from "lucide-react";
import { ProjectHeader } from "~/components/project-header";
import { Input } from "~/components/ui/input";
import { ResourceDetailsDrawer } from "~/components/resource-details-drawer";
import { ProjectGroups } from "~/components/project-groups";
import { useCreateResourceWizard } from "~/CreateResourceWizardContext";
import { Button } from "~/components/ui/button";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
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
import { getIconComponent } from "~/lib/hero-icon.jsx";
import { DataTableColumnHeader } from "~/components/data-table-column-header.jsx";

export default function _index() {
  const { selectedProject } = useAppContext();

  const { isLoading, resourceTypes, resources } = useContext(ResourceContext);
  const { openWizard: openCreateWizard } = useCreateResourceWizard();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const allResources = useMemo(() => {
    return [...resources.values()]
      .flatMap((resources) => [...resources.values()])
      .filter((resource) => resource.kind !== "Block");
  }, [resources]);

  useEffect(() => {
    console.log({
      resources,
    });
  }, [resources]);
  useEffect(() => {
    console.log({
      allResources,
    });
  }, [allResources]);

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex h-full w-full flex-col overflow-auto py-12 sm:px-6 lg:px-8">
        <ProjectHeader selectedProject={selectedProject} />
        <div className="container mx-auto flex items-center space-x-4 rounded-lg">
          <div className="relative flex-grow">
            <Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              type="text"
              placeholder="Search resource..."
              value={searchQuery}
              onChange={handleSearch}
              className="bg-color-wite h-10 w-full py-2 pl-8 pr-4"
            />
          </div>
          <Button onClick={() => openCreateWizard()}>New Resource...</Button>
          <ResourceDetailsDrawer />
        </div>
        <div className={"container mx-auto mt-12"}>
          {isLoading ||
          !resourceTypes ||
          Object.keys(resourceTypes).length === 0 ? (
            <LoadingSkeleton />
          ) : (
            <>
              <Projects resources={allResources} />
              <ProjectGroups
                resourceTypes={resourceTypes}
                searchQuery={searchQuery}
                isLoading={isLoading}
              />
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
        cell: (props) => <div>{props.row.original.metadata.name}</div>,
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
            <div className="flex items-center">
              <Icon className="mr-2 h-4 w-4" />
              {props.row.original.kind}
            </div>
          );
        },
      },
      {
        accessorKey: "system",
        header: (props) => (
          <DataTableColumnHeader column={props.column} title="System" />
        ),
        cell: (props) => <SystemBadge blockUri={props.row.original.objUri} />,
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

  const table = useReactTable({
    data: props.resources,
    columns,
    // state: {
    //   columnVisibility,
    //   columnOrder,
    // },
    // onColumnVisibilityChange: setColumnVisibility,
    // onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    // debugTable: true,
    // debugHeaders: true,
    // debugColumns: true,
  });

  return (
    // <pre>
    //   <code>{JSON.stringify(props.resources, undefined, 2)}</code>
    // </pre>
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
                      header.column.id === "kind" ||
                      header.column.id === "system" ||
                      header.column.id === "namespace" ||
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
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {/* <TableFooter>
          {table.getFooterGroups().map((footerGroup) => (
            <TableRow key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </TableRow>
          ))}
        </TableFooter> */}
      </Table>
    </div>
  );
};

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
