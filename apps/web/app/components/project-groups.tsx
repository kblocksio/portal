import { ResourceType } from "@repo/shared";
import { ProjectGroup } from "~/components/project-group";
export interface ProjectEntitiesProps {
  resourceTypes: Record<string, ResourceType>;
  searchQuery?: string;
  isLoading: boolean;
}
export const ProjectGroups = ({
  resourceTypes,
  searchQuery,
  isLoading,
}: ProjectEntitiesProps) => {

  return Object.entries(resourceTypes).map(([objType, resourceType], index) => (
    <ProjectGroup key={index}
      objType={objType}
      resourceType={resourceType}
      searchQuery={searchQuery}
      isLoading={isLoading} />
  ));
};
