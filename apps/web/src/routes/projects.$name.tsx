import { createFileRoute } from "@tanstack/react-router";
import { useBreadcrumbs } from "@/app-context";

import { ProjectHeader } from "@/components/project-header";
import { ResourceTable } from "@/components/resource-table/resource-table";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc";

export const Route = createFileRoute("/projects/$name")({
  component: ProjectPage,
});

function ProjectPage() {
  const { name } = Route.useParams();

  useBreadcrumbs([{ name: "Projects" }, { name }]);

  const project = trpc.getProject.useQuery({ name });

  const resources = trpc.listProjectResources.useQuery({ name });

  return (
    <div className="flex flex-col gap-10 pt-8">
      {project.data && <ProjectHeader project={project.data} />}
      {resources.isLoading && <LoadingSkeleton />}
      {resources.data && <ResourceTable resources={resources.data} />}
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
