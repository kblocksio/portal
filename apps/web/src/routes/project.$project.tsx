import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useContext, useEffect, useMemo } from "react";
import { useAppContext } from "@/app-context";
import { ResourceTable } from "@/components/resource-table/resource-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceContext } from "@/resource-context";
import { ProjectHeader } from "@/components/project-header";

export const Route = createFileRoute("/project/$project")({
  component: Project,
});

function Project() {
  const { selectedProject, setSelectedProject, projects } = useAppContext();
  const { project } = Route.useParams();
  const { resourceTypes, objects } = useContext(ResourceContext);
  const navigate = useNavigate();

  console.log("resourceTypes", resourceTypes);

  useEffect(() => {
    if (!projects || projects.length === 0) {
      return;
    }
    if (!selectedProject) {
      const projectObj = projects.find((p) => p.value === project);
      if (projectObj) {
        setSelectedProject(projectObj);
      } else {
        navigate({
          to: "/",
        });
      }
    }
  }, [selectedProject, projects, project, navigate, setSelectedProject]);

  const allResources = useMemo(() => {
    return Object.values(objects).filter((r) => r.kind !== "Block");
  }, [objects]);

  return (
    <div className="container flex flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      <ProjectHeader selectedProject={selectedProject} />
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
