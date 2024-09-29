import { useEffect } from "react";
import { useResources } from "./use-resources";
import { useFetch } from "./use-fetch";

export interface SyncResourcesContextProps { }

export const useSyncResourcesContext = () => {
  const { resources, handleObjectMessages } = useResources();
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
