import { createFileRoute, useLocation } from "@tanstack/react-router";
import {
  defaultResourceSorting,
  ResourceTable,
  useResourceTable,
} from "@/components/resource-table/resource-table";
import { useIconComponent } from "@/lib/get-icon";
import { RoutePageHeader } from "@/components/route-page-header";
import { useBreadcrumbs } from "@/app-context";
import { trpc } from "@/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { TablePagination } from "@/components/resource-table/table-pagination";
import { keepPreviousData } from "@tanstack/react-query";
import { useLocalStorage } from "@/hooks/use-localstorage";
import {
  getCoreRowModel,
  type ColumnFiltersState,
  type ColumnSort,
} from "@tanstack/react-table";

export const Route = createFileRoute("/resources/")({
  component: Resources,
});

export const meta = {
  description:
    "Here is a comprehensive list of resources associated with your account. You can manage these resources, view their status, edit, update, delete, check logs, and access detailed information, relationships, and other useful insight",
  icon: "heroicon://list-bullet",
};

function Resources() {
  useBreadcrumbs([{ name: "Resources" }], []);

  const Icon = useIconComponent({ icon: meta.icon });

  const [page, setPage] = useState(1);

  const location = useLocation();

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useLocalStorage<ColumnFiltersState>(
    JSON.stringify([location.pathname, "columnFilters"]),
    [],
  );
  const [sorting, setSorting] = useLocalStorage<ColumnSort[]>(
    JSON.stringify([location.pathname, "sorting"]),
    defaultResourceSorting,
  );

  const queryFilters = useMemo(() => {
    const filters: Record<string, unknown> = {};
    columnFilters.forEach((filter) => {
      filters[filter.id] = filter.value;
    });
    filters.text = globalFilter;
    return filters;
  }, [columnFilters, globalFilter]);

  const resources = trpc.listResources.useQuery(
    {
      page,
      perPage: 20,
      filters: queryFilters,
      sorting,
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  const table = useResourceTable({
    data: resources.data?.data ?? [],
    state: {
      columnFilters,
      sorting,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });

  return (
    <div className="flex flex-col gap-10 py-2 pt-8">
      <RoutePageHeader
        title="Resources"
        description={meta.description}
        Icon={Icon}
      />

      <div>
        {resources.isLoading && <LoadingSkeleton />}

        {resources.data && (
          <ResourceTable table={table} fetching={resources.isFetching} />
        )}

        {resources.data?.pageCount !== undefined && (
          <TablePagination
            page={page}
            pageCount={resources.data.pageCount}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
const LoadingSkeleton = () => {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="w-full">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex grow items-center justify-between">
              <div className="flex grow items-center space-x-4 sm:w-auto">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-full sm:max-w-40" />
              </div>
              <Skeleton className="hidden h-4 w-32 sm:block" />
            </div>
            <div className="flex w-full items-center justify-between">
              <div className="flex grow items-center space-x-4 sm:w-auto">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-full sm:max-w-40" />
              </div>
              <Skeleton className="hidden h-4 w-32 sm:block" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
