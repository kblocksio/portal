import { getResources } from "@/lib/backend";
import { ResourceQuery } from "@kblocks-portal/shared";

export const k8sFetcher = async (query: ResourceQuery) => {
  try {
    const data = await getResources(query);

    const map: Record<string, any> = {};

    data?.items.forEach((item: any) => {
      map[`${item.metadata.namespace}/${item.metadata.name}`] = item;
    });

    return map;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to load data.");
  }
};
