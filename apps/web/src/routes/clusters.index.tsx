import { createFileRoute } from "@tanstack/react-router";
import { useBreadcrumbs } from "@/app-context";
import { getIconComponent } from "@/lib/get-icon";
import { RoutePageHeader } from "@/components/route-page-header";
import {
  ResourceTable,
  useResourceTable,
} from "@/components/resource-table/resource-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { trpc } from "@/trpc";
import { getFilteredRowModel, getSortedRowModel } from "@tanstack/react-table";
import { getCoreRowModel } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/clusters/")({
  component: Clusters,
});

function Clusters() {
  const clusters = trpc.listClusters.useQuery();

  const navigate = useNavigate();
  const Icon = getIconComponent({ icon: "heroicon://rectangle-group" });

  useBreadcrumbs(() => {
    return [{ name: "Clusters" }];
  }, []);

  const handleAddCluster = () => {
    navigate({
      to: "/resources/new/$group/$version/$plural",
      params: {
        group: "kblocks.io",
        version: "v1",
        plural: "clusters",
      },
    });
  };

  const table = useResourceTable({
    data: clusters.data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (clusters.isLoading) {
    return (
      <div className="container mx-auto flex flex-col gap-4">
        <div className="flex flex-col gap-4 pb-8 pt-8">
          <RoutePageHeader
            title="Clusters"
            description="These are the clusters available in the platform."
            Icon={Icon}
          />
          <ClustersSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex flex-col gap-4 pb-8 pt-8">
        <RoutePageHeader
          title="Clusters"
          description="These are the clusters available in the platform."
          Icon={Icon}
        />
        {clusters.isLoading && <ClustersSkeleton />}
        {!clusters.isLoading &&
          (!clusters.data || clusters.data.length === 0) && (
            <ClustersEmptyState handleAddCluster={handleAddCluster} />
          )}
        {!clusters.isLoading && clusters.data && clusters.data.length > 0 && (
          <ResourceTable
            table={table}
            showActions={false}
            customNewResourceAction={{
              label: "Add Cluster",
              navigate: handleAddCluster,
            }}
          />
        )}
      </div>
    </div>
  );
}

const ClustersEmptyState = ({
  handleAddCluster,
}: {
  handleAddCluster: () => void;
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
          <Button onClick={handleAddCluster}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add new cluster
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

function ClustersSkeleton() {
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
