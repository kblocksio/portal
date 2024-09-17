import { getProjects } from "~/services/get-projects";
import { json } from "@remix-run/node";

export const loader = async () => {
  return json(await getProjects());
}