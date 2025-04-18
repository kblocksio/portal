import { twMerge } from "tailwind-merge";
import { ClassValue, clsx } from "clsx";
import type { ApiObject } from "@kblocks/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getReadyCondition(obj: ApiObject) {
  return obj.status?.conditions?.find(
    (condition: any) => condition.type === "Ready",
  );
}

export const propertiesBlackList = [
  "lastStateHash",
  "projects",
  "type",
  "relationships",
  "references",
];

const containsString = (arr1: string[], arr2: string[]): boolean => {
  return arr1.some((item) => arr2.includes(item));
};

function addProperty(
  target: Record<string, any>,
  value: any,
  keyPrefix: string[] = [],
) {
  if (containsString(keyPrefix, propertiesBlackList)) {
    return;
  }
  if (value === undefined) {
    return;
  }

  if (typeof value === "object" && value !== null && keyPrefix.length === 0) {
    for (const [k, v] of Object.entries(value)) {
      addProperty(target, v, [...keyPrefix, k]);
    }
  } else {
    target[keyPrefix.join(".")] = value;
  }
}

export function getResourceProperties(resource: ApiObject) {
  const properties: Record<string, any> = {};
  addProperty(properties, {
    ...resource,
    status: undefined,
    metadata: undefined,
    apiVersion: undefined,
    kind: undefined,
    objType: undefined,
    objUri: undefined,
  });
  return properties;
}

export function getResourceOutputs(resource: ApiObject) {
  const outputs: Record<string, any> = {};

  for (const [key, value] of Object.entries(resource.status ?? {})) {
    if (key === "conditions") {
      continue;
    }

    addProperty(outputs, value, [key]);
  }

  return outputs;
}

export const splitAndCapitalizeCamelCase = (str: string): string => {
  if (!str) {
    return "";
  }

  return (
    str
      // Insert a space between lowercase and uppercase letters
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Insert a space between sequences of uppercase letters followed by lowercase letters
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      // Split the string into words
      .split(" ")
      // Capitalize the first letter of each word
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      // Join the words back into a single string
      .join(" ")
  );
};
