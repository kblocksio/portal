import { ResourceType } from "@repo/shared";
import { ProjectGroup } from "~/components/project-group";
import { useSyncResourcesContext } from "~/hooks/sync-resouces-context";
export interface ProjectEntitiesProps {
  resourceTypes: Record<string, ResourceType>;
  searchQuery?: string;
}
export const ProjectGroups = ({
  resourceTypes,
  searchQuery,
}: ProjectEntitiesProps) => {

  const { isLoading } = useSyncResourcesContext();

  return Object.entries(resourceTypes).map(([objType, resourceType], index) => (
    <ProjectGroup key={index} objType={objType} resourceType={resourceType} searchQuery={searchQuery} isLoading={isLoading} />
  ));
};
