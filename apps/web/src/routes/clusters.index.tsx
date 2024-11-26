import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect } from "react";
import { ResourceContext } from "@/resource-context";
import { useAppContext } from "@/app-context";
import { getIconComponent } from "@/lib/get-icon";
import { RoutePageHeader } from "@/components/route-page-header";
import { ResourceTable } from "@/components/resource-table/resource-table";

export const Route = createFileRoute("/clusters/")({
  component: Clusters,
});

function Clusters() {
  const { clusters } = useContext(ResourceContext);
  const { setBreadcrumbs } = useAppContext();

  const Icon = getIconComponent({ icon: "heroicon://rectangle-group" });

  useEffect(() => {
    setBreadcrumbs([{ name: "Clusters" }]);
  }, [setBreadcrumbs]);

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex flex-col gap-4 pb-8 pt-8">
        <RoutePageHeader
          title="Clusters"
          description="These are the clusters available in the platform."
          Icon={Icon}
        />
        <ResourceTable resources={clusters} showActions={false} />
      </div>
    </div>
  );
}
