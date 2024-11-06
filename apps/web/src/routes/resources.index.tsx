import { ResourceContext } from "@/resource-context";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useContext, useMemo } from "react";
import { useAppContext } from "@/app-context";

import { ProjectHeader } from "@/components/project-header";
import { ResourceTable } from "@/components/resource-table/resource-table";
import { Project } from "@repo/shared";
import { Skeleton } from "@/components/ui/skeleton";
export const Route = createFileRoute("/resources/")({
  component: Resources,
});

export const ResourcePageProject: Project = {
  label: "Resources",
  value: "Resources",
  description:
    "Here is a comprehensive list of resources associated with your account. You can manage these resources, view their status, edit, update, delete, check logs, and access detailed information, relationships, and other useful insight",
  icon: "LayoutDashboard",
};

function Resources() {
  const { resourceTypes, objects } = useContext(ResourceContext);
  const { setBreadcrumbs } = useAppContext();

  const allResources = useMemo(() => {
    return Object.values(objects).filter((r) => {
      if (r.kind === "Block") {
        return false;
      }

      // don't show resources that are children of other resources
      if (r.metadata?.ownerReferences?.length) {
        return false;
      }

      return true;
    });
  }, [objects]);

  useEffect(() => {
    setBreadcrumbs([{ name: "Resources" }]);
  }, [setBreadcrumbs]);

  return (
    <div className="flex flex-col gap-8 py-4 sm:gap-12 sm:py-8">
      <ProjectHeader selectedProject={ResourcePageProject} />
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
