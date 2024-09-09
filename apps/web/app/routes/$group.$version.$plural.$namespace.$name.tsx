import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { k8sFetcher } from "~/hooks/k8s-fetcher";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const data = await k8sFetcher({
    group: params.group || "",
    version: params.version || "",
    plural: params.plural || "",
  });

  return data;
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
