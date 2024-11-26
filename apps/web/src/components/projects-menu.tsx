import { useCallback, useContext } from "react";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";
import { Project, ResourceContext } from "@/resource-context";
import { createResource } from "@/lib/backend";
import { parseBlockUri } from "@kblocks/api";
import { cn } from "@/lib/utils";
export const ProjectsMenu = ({ objUris }: { objUris: string[] }) => {
  const { projects } = useContext(ResourceContext);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        disabled={!projects || projects.length === 0}
        className={cn(!projects || (projects.length === 0 && "opacity-50"))}
      >
        Project
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <ProjectItems objUris={objUris} />
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

export const ProjectItems = ({ objUris }: { objUris: string[] }) => {
  const { projects, resourceTypes } = useContext(ResourceContext);

  const isChecked = useCallback(
    (project: Project) => {
      return project.objects?.some((o) => objUris.includes(o));
    },
    [objUris],
  );

  const handleCheckedChange = (project: Project, checked: boolean) => {
    const objects = project.objects ?? [];
    project.objects = objects.filter((o) => !objUris.includes(o));

    if (checked) {
      project.objects = [...objects, ...objUris];
    }

    const { system } = parseBlockUri(project.objUri);
    const type = resourceTypes[project.objType];
    createResource(system, type, project).catch((e) => {
      console.error(e);
    });
  };

  return projects.map((project) => {
    return (
      <DropdownMenuCheckboxItem
        checked={isChecked(project)}
        onCheckedChange={(checked) => handleCheckedChange(project, checked)}
        onClick={(e) => e.stopPropagation()}
        key={project.metadata.name}
      >
        {project.title ?? project.metadata.name}
      </DropdownMenuCheckboxItem>
    );
  });
};
