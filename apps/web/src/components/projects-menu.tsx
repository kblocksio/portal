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

export const ProjectsMenu = ({ objUri }: { objUri: string }) => {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Add to Project</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <ProjectItems objUri={objUri} />
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

export const ProjectItems = ({ objUri }: { objUri: string }) => {
  const { projects, resourceTypes } = useContext(ResourceContext);

  const isChecked = useCallback((project: Project) => {
    return project.objects?.includes(objUri);
  }, [objUri]);

  const handleCheckedChange = (project: Project, checked: boolean) => {
    const objects = project.objects ?? [];
    project.objects = objects.filter((o) => o !== objUri);
    
    if (checked) {
      project.objects = [...objects, objUri];
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
        {project.metadata.name}
      </DropdownMenuCheckboxItem>
    );
  });
};
