import { ResourceIcon } from "@/lib/get-icon";
import { useState } from "react";

import { Button } from "./ui/button";
import { MoreVertical } from "lucide-react";
import { parseBlockUri } from "@kblocks/api";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "./ui/dropdown-menu";
import { DeleteProjectDialog } from "./delete-project";
import type { TrpcProject } from "@kblocks-portal/server";

export interface ProjectHeaderProps {
  project: TrpcProject;
}

export const ProjectHeader = ({ project }: ProjectHeaderProps) => {
  const navigate = useNavigate();

  const { group, version, plural, system, namespace, name } = parseBlockUri(
    project.objUri,
  );

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex flex-row items-start justify-between space-y-0">
      <div className="flex-1 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          <div className="flex items-center gap-4">
            <ResourceIcon
              icon={project.icon ?? "heroicon://folder"}
              className="h-8 w-8"
            />
            {project.title ?? project.name}
          </div>
        </h1>
        <p className="text-md text-muted-foreground min-h-10">
          {project.description}
        </p>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="secondary"
          onClick={() =>
            navigate({
              to: `/resources/edit/${group}/${version}/${plural}/${system}/${namespace}/${name}`,
            })
          }
        >
          Edit
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              <div className="-mx-2">
                <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => {
                setIsDeleteOpen(true);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DeleteProjectDialog
        projects={[project]}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          navigate({ to: "/" });
        }}
      />
    </div>
  );
};
