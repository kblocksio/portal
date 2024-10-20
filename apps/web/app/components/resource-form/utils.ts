export const reorderProperties = (schema: any): any => {
  if (schema && typeof schema === "object") {
    // Reorder properties if they exist
    if (schema.properties && typeof schema.properties === "object") {
      const properties = schema.properties;
      const propNames = Object.keys(properties);

      // Extract order from descriptions
      const propArray = propNames.map(propName => {
        const propSchema = properties[propName];
        const description = propSchema.description || '';
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
        properties: newProperties
      };
    } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      // Recurse into additionalProperties if they exist
      return {
        ...schema,
        additionalProperties: reorderProperties(schema.additionalProperties)
      };
    } else {
      // Recurse into items if it's an array
      if (schema.items) {
        return {
          ...schema,
          items: reorderProperties(schema.items)
        };
      }
    }
  }

  // Return the schema as is if no properties to reorder
  return schema;
};
