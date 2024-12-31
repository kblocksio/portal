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

export const Route = createFileRoute("/organizations/")({
  component: Organizations,
});

function Organizations() {
  const { data: organizations } = trpc.listOrganizations.useQuery(undefined, {
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
    data: organizations,
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
        <div className="flex flex-col gap-4">
          <ResourceTable
            table={table}
            showActions={false}
            customNewResourceAction={{
              label: "Add Organization",
              navigate: handleAddOrganization,
            }}
          />
        </div>
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
