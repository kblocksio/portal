import { useContext, useEffect } from "react";
import { useFetch } from "./use-fetch";
import { ResourceContext } from "~/ResourceContext";

export interface SyncResourcesContextProps { }

export const useSyncResourcesContext = () => {
  const { handleObjectMessages } = useContext(ResourceContext);
  const { data: initialResources, isLoading } = useFetch<{ objects: any[] }>(
    `/api/resources`
  );

  useEffect(() => {
    if (!initialResources || !initialResources.objects) {
      return;
    }
    handleObjectMessages(initialResources.objects);
  }, [initialResources]);

  return { isLoading };
};
