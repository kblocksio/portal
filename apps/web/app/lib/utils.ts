import { ClassValue } from "class-variance-authority/types";
import { twMerge } from "tailwind-merge";
import { ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Schema = {
  type?: string;
  properties?: { [key: string]: Schema };
  items?: Schema;
  additionalProperties?: boolean | Schema;
};
