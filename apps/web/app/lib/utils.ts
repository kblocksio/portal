import { twMerge } from "tailwind-merge";
import { ClassValue, clsx } from "clsx";
import { ApiObject } from "@kblocks/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getReadyCondition(obj: ApiObject) {
  return obj.status?.conditions?.find(
    (condition: any) => condition.type === "Ready",
  );
}
