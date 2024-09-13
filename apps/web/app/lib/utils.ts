import { z, ZodRawShape, ZodType } from "zod";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertJsonSchemaToZod = (schema: any): ZodType<any> => {
  if (!schema) return z.unknown(); // Default to unknown if schema is not provided

  switch (schema.type) {
    case "object":
      return z
        .object(
          Object.fromEntries(
            Object.entries(schema.properties || {}).map(([key, prop]) => [
              key,
              convertJsonSchemaToZod(prop).optional(),
            ]),
          ) as ZodRawShape,
        )
        .strict();

    case "array":
      return z.array(convertJsonSchemaToZod(schema.items));

    case "string":
      if (schema.format === "date-time") {
        return z.string().refine((value) => !isNaN(Date.parse(value)), {
          message: "Invalid date-time format",
        });
      }
      return z.string();

    case "number":
      return z.number();

    case "boolean":
      return z.boolean();

    case "null":
      return z.null();

    case "integer":
      return z.number(); // Zod does not differentiate between integer and number; handle as number

    default:
      return z.unknown();
  }
};
