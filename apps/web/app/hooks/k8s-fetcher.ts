export interface Params {
  group: string;
  version: string;
  plural: string;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export const k8sFetcher = async (params: Params) => {
  const queryParams = new URLSearchParams({
    group: params.group || "",
    version: params.version || "",
    plural: params.plural || "",
  }).toString();
  // Construct the full URL with query parameters
  const url = `${SERVER_URL}/api/resources?${queryParams}`;

  try {
    const res = await fetch(url); // Send the request to the server
    if (!res.ok) {
      throw new Error(`Error fetching data from server: ${res.statusText}`);
    }

    const data = await res.json();

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
