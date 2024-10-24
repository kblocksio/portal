import { createFileRoute } from "@tanstack/react-router";
import { useAppContext } from "~/app-context";
import { useContext, useMemo } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { ResourceContext } from "~/resource-context";
import { ProjectHeader } from "~/components/project-header";
import { Projects } from "~/components/projects";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { selectedProject } = useAppContext();

  const { isLoading, resourceTypes, resources } = useContext(ResourceContext);

  const allResources = useMemo(() => {
    return [...resources.values()]
      .flatMap((resources) => [...resources.values()])
      .filter((resource) => resource.kind !== "Block");
  }, [resources]);

  return (
    <div className="container mx-auto flex flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
      <ProjectHeader selectedProject={selectedProject} />

      <div>
        {isLoading ||
        !resourceTypes ||
        Object.keys(resourceTypes).length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <>
            <Projects resources={allResources} />
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
