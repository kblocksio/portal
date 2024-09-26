import { useContext } from "react";
import { ResourceContext, ResourceContextValue } from "~/ResourceContext";

export const useResources = (): ResourceContextValue => {
  const { resources, handleObjectMessages } = useContext(ResourceContext);
  if (!resources || !handleObjectMessages) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return { resources, handleObjectMessages };
};
