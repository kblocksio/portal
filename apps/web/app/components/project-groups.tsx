import { ApiGroup } from "@repo/shared";
import { ProjectGroup } from "~/components/project-group";
import { useEffect } from "react";
export interface ProjectEntitiesProps {
  apiGroups: ApiGroup[];
  searchQuery?: string;
}
export const ProjectGroups = ({
  apiGroups,
  searchQuery,
}: ProjectEntitiesProps) => {
  return apiGroups.map((api, index) => (
    <ProjectGroup key={index} apiGroup={api} searchQuery={searchQuery} />
  ));
};
