import { ResourceType } from "@repo/shared";
import { ProjectGroup } from "~/components/project-group";
export interface ProjectEntitiesProps {
  resourceTypes: ResourceType[];
  searchQuery?: string;
}
export const ProjectGroups = ({
  resourceTypes,
  searchQuery,
}: ProjectEntitiesProps) => {
  return resourceTypes.map((resourceType, index) => (
    <ProjectGroup key={index} resourceType={resourceType} searchQuery={searchQuery} />
  ));
};
