import { createFileRoute } from "@tanstack/react-router";
import { useBreadcrumbs } from "@/app-context";
import { getIconComponent } from "@/lib/get-icon";
import { RoutePageHeader } from "@/components/route-page-header";
import {
  ResourceTable,
  useResourceTable,
} from "@/components/resource-table/resource-table";
import { useNavigate } from "@tanstack/react-router";
import { trpc } from "@/trpc";
import { getFilteredRowModel, getSortedRowModel } from "@tanstack/react-table";
import { getCoreRowModel } from "@tanstack/react-table";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/organizations/")({
  component: Organizations,
});

function Organizations() {
  const organizations = trpc.listOrganizations.useQuery(undefined, {
    initialData: [],
  });

  const navigate = useNavigate();
  const Icon = getIconComponent({ icon: "heroicon://user-group" });

  useBreadcrumbs(() => {
    return [{ name: "Organizations" }];
  }, []);

  const handleAddOrganization = () => {
    navigate({
      to: "/resources/new/$group/$version/$plural",
      params: {
        group: "kblocks.io",
        version: "v1",
        plural: "organizations",
      },
    });
  };

  const table = useResourceTable({
    data: organizations.data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex flex-col gap-4 pb-8 pt-8">
        <RoutePageHeader
          title="Organizations"
          description="These are the organizations available in the portal."
          Icon={Icon}
        />

        {organizations.isLoading && <OrganizationsSkeleton />}
        {!organizations.isLoading &&
          (!organizations.data || organizations.data.length === 0) && (
            <OrganizationsEmptyState
              handleAddOrganization={handleAddOrganization}
            />
          )}
        {!organizations.isLoading &&
          organizations.data &&
          organizations.data.length > 0 && (
            <ResourceTable
              table={table}
              showActions={false}
              customNewResourceAction={{
                label: "Add Organization",
                navigate: handleAddOrganization,
              }}
            />
          )}
      </div>
    </div>
  );
}

const OrganizationsEmptyState = ({
  handleAddOrganization,
}: {
  handleAddOrganization: () => void;
}) => {
  return (
    <div className="p-6">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-background mb-4 rounded-full p-3">
            <PlusCircle className="text-muted-foreground h-12 w-12" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">No clusters found</h2>
          <p className="text-muted-foreground mb-4 max-w-sm text-sm">
            Get started by adding your first cluster
          </p>
          <Button onClick={handleAddOrganization}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add new cluster
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

function OrganizationsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
