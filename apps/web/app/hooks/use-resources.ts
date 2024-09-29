import { useContext } from "react";
import { ResourceContext, ResourceContextValue } from "~/ResourceContext";

export const useResources = (): ResourceContextValue => {
  const { resources, handleObjectMessages, resourcesLogs } = useContext(ResourceContext);
  if (!resources || !handleObjectMessages || !resourcesLogs) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return { resources, resourcesLogs, handleObjectMessages };
};
