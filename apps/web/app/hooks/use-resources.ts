import { useContext } from "react";
import { ResourceContext, ResourceContextValue } from "~/ResourceContext";

export const useResources = (): ResourceContextValue => {
  const { resources, handleObjectMessages, resourcesLogs, resourceTypes, isLoading } = useContext(ResourceContext);
  if (!resources || !handleObjectMessages || !resourcesLogs || !resourceTypes) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return { resources, resourcesLogs, handleObjectMessages, resourceTypes, isLoading };
};
