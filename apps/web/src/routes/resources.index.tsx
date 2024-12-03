import { ResourceContext } from "@/resource-context";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useContext, useMemo } from "react";
import { useAppContext } from "@/app-context";

import { ResourceTable } from "@/components/resource-table/resource-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getIconComponent } from "@/lib/get-icon";
import { RoutePageHeader } from "@/components/route-page-header";
export const Route = createFileRoute("/resources/")({
  component: Resources,
});

export const meta = {
  description:
    "Here is a comprehensive list of resources associated with your account. You can manage these resources, view their status, edit, update, delete, check logs, and access detailed information, relationships, and other useful insight",
  icon: "heroicon://list-bullet",
};

function Resources() {
  // const { resourceTypes, objects } = useContext(ResourceContext);
  // const { setBreadcrumbs } = useAppContext();

  // const Icon = getIconComponent({ icon: meta.icon });

  // const allResources = useMemo(() => {
  //   return Object.values(objects).filter((r) => {
  //     if (r.objType === "kblocks.io/v1/blocks") {
  //       return false;
  //     }

  //     if (r.objType === "kblocks.io/v1/projects") {
  //       return false;
  //     }

  //     if (r.objType === "kblocks.io/v1/clusters") {
  //       return false;
  //     }

  //     // don't show resources that are children of other resources
  //     if (r.metadata?.ownerReferences?.length) {
  //       return false;
  //     }

  //     return true;
  //   });
  // }, [objects]);

  // useEffect(() => {
  //   setBreadcrumbs([{ name: "Resources" }]);
  // }, [setBreadcrumbs]);

  return (
    <div className="flex flex-col gap-10 py-2 pt-8">
      {/* <RoutePageHeader
        title="Resources"
        description={meta.description}
        Icon={Icon}
      /> */}
      <div>
        <ResourceTable />
      </div>
    </div>
  );
}
