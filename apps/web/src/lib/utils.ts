import { twMerge } from "tailwind-merge";
import { ClassValue, clsx } from "clsx";
import { ApiObject } from "@kblocks/api";
import { Resource } from "@/resource-context";

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

const propertiesBlackList = ["lastStateHash"];

const containsString = (arr1: string[], arr2: string[]): boolean => {
  return arr1.some((item) => arr2.includes(item));
};

function addProperty(
  target: Record<string, string>,
  value: any,
  keyPrefix: string[] = [],
) {
  if (containsString(keyPrefix, propertiesBlackList)) {
    return;
  }
  if (value === undefined) {
    return;
  }
  if (Array.isArray(value)) {
    target[keyPrefix.join(".")] = JSON.stringify(value, null, 2);
  } else if (typeof value === "object" && value !== null) {
    for (const [k, v] of Object.entries(value)) {
      addProperty(target, v, [...keyPrefix, k]);
    }
  } else {
    target[keyPrefix.join(".")] = value;
  }
}

export function getResourceProperties(resource: Resource) {
  const properties: Record<string, string> = {};
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

export function getResourceOutputs(resource: Resource) {
  const outputs: Record<string, string> = {};
  addProperty(outputs, {
    ...resource.status,
    conditions: undefined,
  });
  return outputs;
}
