import { ResourceType } from "@repo/shared";
import { ProjectGroup } from "~/components/project-group";
import { useSyncResourcesContext } from "~/hooks/sync-resouces-context";
export interface ProjectEntitiesProps {
  resourceTypes: ResourceType[];
  searchQuery?: string;
}
export const ProjectGroups = ({
  resourceTypes,
  searchQuery,
}: ProjectEntitiesProps) => {

  const { isLoading } = useSyncResourcesContext();

  return resourceTypes.map((resourceType, index) => (
    <ProjectGroup key={index} resourceType={resourceType} searchQuery={searchQuery} isLoading={isLoading} />
  ));
};
