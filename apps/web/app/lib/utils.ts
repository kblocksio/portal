import { z, ZodRawShape, ZodType } from "zod";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const prepareOpenApiSchemaForAutoForm = (schema: any): ZodType<any> => {
  if (!schema) return z.unknown(); // Default to unknown if schema is not provided
  delete schema.properties.status;
  return convertJsonSchemaToZod(schema, "");
};

const convertJsonSchemaToZod = (schema: any, key: string): ZodType<any> => {
  if (!schema) return z.unknown(); // Handle empty or missing schemas

  switch (schema.type) {
    case "object": {
      // Check if additionalProperties exists (for records)
      if (schema.additionalProperties) {
        return z.record(
          convertJsonSchemaToZod(schema.additionalProperties, key),
        );
      }

      // Otherwise, handle as a standard object schema
      const shape: ZodRawShape = Object.fromEntries(
        Object.entries(schema.properties || {}).map(([key, prop]) => {
          const zodProp = convertJsonSchemaToZod(prop, key); // Recursive conversion
          // Mark field as required or optional based on the "required" array
          return [
            key,
            // schema.required?.includes(key) ? zodProp : zodProp.optional(),
            zodProp,
          ];
        }),
      );
      return z.object(shape).strict(); // Return strict Zod object schema
    }

    case "array": {
      const itemSchema = convertJsonSchemaToZod(schema.items, key);

      // Check if array items are of primitive types (string, number, boolean)
      if (
        schema.items?.type === "string" ||
        schema.items?.type === "number" ||
        schema.items?.type === "boolean"
      ) {
        // If primitives, wrap in an object schema with a single field key
        return z.array(z.object({ [key]: itemSchema }));
      } else {
        // For arrays of complex types (objects), return array schema directly
        return z.array(itemSchema);
      }
    }

    case "string": {
      // Handle special string formats like date-time
      if (schema.format === "date-time") {
        return z.string().refine((value) => !isNaN(Date.parse(value)), {
          message: "Invalid date-time format",
        });
      }
      return z.string();
    }

    case "number": {
      return z.number(); // Return number schema
    }

    case "boolean": {
      return z.boolean(); // Return boolean schema
    }

    case "integer": {
      return z.number().int(); // Return integer schema (as Zod doesn't have a separate integer type)
    }

    case "null": {
      return z.null(); // Return null schema
    }

    default:
      return z.unknown(); // For unknown types, return Zod unknown type
  }
};
