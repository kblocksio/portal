import { ProjectCard } from "./project-card";
import { useContext, useMemo } from "react";
import { ResourceContext } from "@/resource-context";
import { useNavigate } from "@tanstack/react-router";
import { getResourcesStatuses } from "./components-utils";
import { useAppContext } from "@/app-context";

export const MyProjects = () => {
  const { projects } = useAppContext();
  const { objects } = useContext(ResourceContext);
  const { setSelectedProject } = useAppContext();
  const navigate = useNavigate();

  const enhancedProjects = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [];
    }
    return projects.map((project) => {
      return {
        ...project,
        // get the resources statuses for the project, currently loading all resources for all projects
        ...getResourcesStatuses(
          Object.values(objects).filter((obj) => obj.project === project.value),
        ),
        onClick: () => {
          setSelectedProject(project);
          navigate({
            to: "/projects/$project",
            params: { project: project.value },
          });
        },
      };
    });
  }, [projects, objects, setSelectedProject, navigate]);

  return (
    <div className="flex flex-col pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">My Projects</h1>
        <p className="text-muted-foreground text-sm">
          These are the projects you are currently part of. Click on the project
          to manage its resources.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-2">
        {enhancedProjects.map((project) => (
          <ProjectCard
            key={project.value}
            project={project}
            onClick={project.onClick}
            failedResourcesNumber={project.failed}
            successfulResourcesNumber={project.completed}
            inProgressResourcesNumber={project.inProgress}
          />
        ))}
      </div>
    </div>
  );
};
