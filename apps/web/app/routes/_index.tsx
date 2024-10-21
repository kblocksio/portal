import { useAppContext } from "~/AppContext";
import { useContext, useMemo } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { ResourceContext } from "~/ResourceContext";
import { ProjectHeader } from "~/components/project-header";
import { Projects } from "~/components/projects";

export default function _index() {
  const { selectedProject } = useAppContext();

  const { isLoading, resourceTypes, resources } = useContext(ResourceContext);

  const allResources = useMemo(() => {
    return [...resources.values()]
      .flatMap((resources) => [...resources.values()])
      .filter((resource) => resource.kind !== "Block");
  }, [resources]);

  return (
    <div className="flex bg-slate-50">
      <div className="flex h-full w-full flex-col overflow-auto py-12 sm:px-6 lg:px-8">
        <ProjectHeader selectedProject={selectedProject} />
        <div className={"container mx-auto"}>
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
