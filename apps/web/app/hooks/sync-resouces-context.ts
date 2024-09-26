import { useEffect } from "react";
import { useResources } from "./use-resources";
import { useFetch } from "./use-fetch";

export interface SyncResourcesContextProps {
  group: string;
  version: string;
  plural: string;
}
export const useSyncResourcesContext = ({ group, version, plural }: SyncResourcesContextProps) => {
  const { handleObjectMessages } = useResources();
  const { data: initialResources, isLoading } = useFetch<{ objects: any[] }>(
    `/api/resources`,
    {
      group,
      version,
      plural,
    },
  );

  useEffect(() => {
    if (!initialResources || !initialResources.objects) {
      return;
    }
    handleObjectMessages(initialResources.objects);
  }, [initialResources]);

  return { isLoading };
};
