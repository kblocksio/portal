import { Circle } from "lucide-react";
import { Project } from "@repo/shared";

export interface ProjectCardProps {
  project: Project;
  failedResourcesNumber: number;
  successfulResourcesNumber: number;
  inProgressResourcesNumber: number;
  onClick: (project: Project) => void;
}
export const ProjectCard = (props: ProjectCardProps) => {
  const {
    project,
    failedResourcesNumber,
    successfulResourcesNumber,
    inProgressResourcesNumber,
    onClick,
  } = props;
  return (
    <div className="w-full pb-4">
      <div className="rounded-md border bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold">{project.label}</h2>
        <div className="text-muted-foreground mb-2 text-sm">
          {project.description}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Circle className="h-3 w-3 fill-current text-red-500" />
              <span className="ml-1 text-sm">{failedResourcesNumber}</span>
            </div>
            <div className="flex items-center">
              <Circle className="h-3 w-3 fill-current text-green-500" />
              <span className="ml-1 text-sm">{successfulResourcesNumber}</span>
            </div>
            <div className="flex items-center">
              <Circle className="h-3 w-3 fill-current text-yellow-500" />
              <span className="ml-1 text-sm">{inProgressResourcesNumber}</span>
            </div>
          </div>
          <button
            className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
            onClick={() => onClick(project)}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};
