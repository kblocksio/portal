import { LoaderFunctionArgs } from "@remix-run/node";
import { getResources } from "~/services/get-resources";
import { json } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json(await getResources(request));
};
