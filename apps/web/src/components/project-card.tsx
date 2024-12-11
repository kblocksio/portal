import { Circle } from "lucide-react";
import { Button } from "./ui/button";
import type { Project } from "@kblocks-portal/server";

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
      <div className="flex min-h-48 flex-col justify-between rounded-md border bg-white p-4 shadow-sm">
        <div className="flex flex-col">
          <h2 className="mb-1 text-lg font-semibold">{project.label}</h2>
          <div className="text-muted-foreground text-sm">
            {project.description}
          </div>
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
          <Button variant="outline" onClick={() => onClick(project)}>
            View
          </Button>
        </div>
      </div>
    </div>
  );
};
