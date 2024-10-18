import { twMerge } from "tailwind-merge";
import { ClassValue, clsx } from "clsx";
import { ApiObject } from "@kblocks/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Schema = {
  type?: string;
  properties?: { [key: string]: Schema };
  items?: Schema;
  additionalProperties?: boolean | Schema;
};

export function getReadyCondition(obj: ApiObject) {
  return obj.status?.conditions?.find(
    (condition: any) => condition.type === "Ready",
  );
}
