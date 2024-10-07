import { ClassValue } from "class-variance-authority/types";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Schema = {
  type?: string;
  properties?: { [key: string]: Schema };
  items?: Schema;
  additionalProperties?: boolean | Schema;
};

export const filterDataBySchema = (schema: any, data: any): any => {
  if (schema.type === 'object' && schema.properties) {
    const result: any = {};
    for (const key in schema.properties) {
      if (data && data.hasOwnProperty(key)) {
        const filteredValue = filterDataBySchema(schema.properties[key], data[key]);
        if (filteredValue !== undefined) {
          result[key] = filteredValue;
        }
      }
    }
    return result;
  } else if (schema.type === 'array' && schema.items) {
    if (Array.isArray(data)) {
      return data
        .map((item) => filterDataBySchema(schema.items as Schema, item))
        .filter((item) => item !== undefined);
    } else {
      // If data is not an array but schema expects an array, return undefined or an empty array
      return [];
    }
  } else {
    // For primitive types, validate the data if necessary
    if (data !== undefined) {
      return data;
    } else {
      return undefined;
    }
  }
}
