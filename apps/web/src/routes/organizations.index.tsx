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

export const Route = createFileRoute("/organizations/")({
  component: Organizations,
});

function Organizations() {
  const { data: organizations = [] } = trpc.listOrganizations.useQuery(
    undefined,
    {
      initialData: [],
    },
  );

  useEffect(() => {
    console.log("mounted");
  }, []);

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
