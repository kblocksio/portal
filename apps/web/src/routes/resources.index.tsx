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
  const { resourceTypes, resources } = useContext(ResourceContext);
  const { setBreadcrumbs } = useAppContext();

  const Icon = getIconComponent({ icon: meta.icon });

  const allResources = useMemo(() => {
    return Object.values(resources).filter((r) => {
      // don't show resources that are children of other resources
      if (r.metadata?.ownerReferences?.length) {
        return false;
      }
      return true;
    });
  }, [resources]);

  useEffect(() => {
    setBreadcrumbs([{ name: "Resources" }]);
  }, [setBreadcrumbs]);

  return (
    <div className="flex flex-col gap-10 py-2 pt-8">
      <RoutePageHeader
        title="Resources"
        description={meta.description}
        Icon={Icon}
      />
      <div>
        {!resourceTypes || Object.keys(resourceTypes).length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <>
            <ResourceTable resources={allResources} />
          </>
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
