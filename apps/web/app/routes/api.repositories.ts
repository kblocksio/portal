import { getRepositories } from "~/services/get-repositories";
import { json } from "@remix-run/node";

export const loader = async () => {
  return json(await getRepositories());
};
