import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import invariant from "@remix-run/react/dist/invariant";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { group, version, plural } = params;

  // Construct query parameters if necessary (you can add more query parameters here)
  const queryParams = new URLSearchParams({
    group: group || "",
    version: version || "",
    plural: plural || "",
  }).toString();

  // Construct the full URL with query parameters
  const url = `${SERVER_URL}/api?${queryParams}`;

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

export default function Index() {
  const params = useParams();
  const [View, setView] = useState<any | null>(null);
  const map = useLoaderData<typeof loader>();

  useEffect(() => {
    import(
      `../components/views/${params.group}/${params.version}/${params.plural}.tsx`
    ).then((module) => {
      setView(() => module.default);
    });
  }, [params.group, params.version, params.plural]);

  const obj = useMemo(() => {
    return map[`${params.namespace}/${params.name}`];
  }, [map]);

  if (!obj) {
    return <div>Not found</div>;
  }

  return View && obj ? <View obj={obj} /> : null;
}
