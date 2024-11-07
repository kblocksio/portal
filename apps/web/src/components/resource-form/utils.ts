export const reorderProperties = (schema: any): any => {
  if (schema && typeof schema === "object") {
    // Reorder properties if they exist
    if (schema.properties && typeof schema.properties === "object") {
      const properties = schema.properties;
      const propNames = Object.keys(properties);

      // Extract order from descriptions
      const propArray = propNames.map((propName) => {
        const propSchema = properties[propName];
        const description = propSchema.description || "";
        const orderMatch = description.match(/@order\s+(\d+)/);
        const order = orderMatch ? parseInt(orderMatch[1], 10) : Infinity;
        return { propName, propSchema, order };
      });

      // Sort properties based on order
      propArray.sort((a, b) => a.order - b.order);

      // Create new ordered properties object
      const newProperties: any = {};
      for (const { propName, propSchema } of propArray) {
        // Recursively reorder nested properties
        newProperties[propName] = reorderProperties(propSchema);
      }

      // Replace the properties with the new ordered properties
      return {
        ...schema,
        properties: newProperties,
      };
    } else if (
      schema.additionalProperties &&
      typeof schema.additionalProperties === "object"
    ) {
      // Recurse into additionalProperties if they exist
      return {
        ...schema,
        additionalProperties: reorderProperties(schema.additionalProperties),
      };
    } else {
      // Recurse into items if it's an array
      if (schema.items) {
        return {
          ...schema,
          items: reorderProperties(schema.items),
        };
      }
    }
  }

  // Return the schema as is if no properties to reorder
  return schema;
};

export const updateDataByPath = (data: any, path: string, value: any): any => {
  if (typeof data !== "object") {
    return value;
  }

  const keys = path.split(".");
  const newData = { ...data };

  let obj = newData;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) {
      obj[keys[i]] = {};
    } else if (Array.isArray(obj[keys[i]])) {
      obj[keys[i]] = [...obj[keys[i]]];
    } else {
      obj[keys[i]] = { ...obj[keys[i]] };
    }
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  return newData;
};

export const getDataByPath = (data: any, path: string) => {
  if (!path) return data;
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), data);
};

export const isObjectPopulated = (obj: any) => {
  return obj && Object.keys(obj).length > 0;
};
