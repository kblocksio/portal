import { getTypes } from "~/services/get-types";
import { json } from "@remix-run/node";

export const loader = async () => {
  return json(await getTypes());
};
