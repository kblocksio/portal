import Ajv, { SchemaObject } from 'ajv';
import crypto from 'crypto';

const ajv = new Ajv({ allErrors: true, strict: false });

const getDefaultValue = (schema: any): any => {
  if (schema.default !== undefined) {
    return schema.default;
  }

  switch (schema.type) {
    case 'string':
      return '';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}

const adjustProvidedValues = (schema: any, providedValues: any): any => {
  if (!schema || typeof schema !== 'object') {
    return providedValues;
  }

  const schemaType = schema.type;

  if (schemaType === 'object') {
    const adjustedObject: { [key: string]: any } = {};
    const properties = schema.properties || {};
    const requiredFields = schema.required || [];

    for (const key of Object.keys(properties)) {
      const propertySchema = properties[key];
      const providedValue = providedValues[key];

      if (providedValue !== undefined) {
        adjustedObject[key] = adjustProvidedValues(propertySchema, providedValue);
      } else if (requiredFields.includes(key)) {
        adjustedObject[key] = getDefaultValue(propertySchema);
      }
    }

    return adjustedObject;
  } else if (schemaType === 'array') {
    if (Array.isArray(providedValues)) {
      return providedValues.map((item) => adjustArrayItem(schema.items, item));
    } else {
      return [adjustArrayItem(schema.items, providedValues)];
    }
  } else {
    return convertValueToType(providedValues, schemaType);
  }
}

const adjustArrayItem = (itemSchema: any, itemValue: any): any => {
  if (itemSchema.type === 'string') {
    return extractStringFromValue(itemValue);
  } else {
    return adjustProvidedValues(itemSchema, itemValue);
  }
}

const extractStringFromValue = (value: any): string => {
  if (typeof value === 'string') {
    return value;
  } else if (typeof value === 'object' && value !== null) {
    // Attempt to extract string from object
    const stringProperties = Object.keys(value).filter(
      (key) => typeof value[key] === 'string'
    );
    if (stringProperties.length === 1) {
      return value[stringProperties[0]];
    } else {
      throw new Error(`Cannot extract string from object: ${JSON.stringify(value)}`);
    }
  } else {
    // If value is neither string nor object, convert it to string
    return String(value);
  }
}

const convertValueToType = (value: any, expectedType: string): any => {
  if (value === null || value === undefined) {
    return getDefaultValue({ type: expectedType });
  }

  if (expectedType === 'string') {
    return extractStringFromValue(value);
  }

  switch (expectedType) {
    case 'number':
      return Number(value);
    case 'integer':
      return parseInt(value, 10);
    case 'boolean':
      return Boolean(value);
    default:
      return value;
  }
}

const validateSpecObject = (schema: SchemaObject, specObject: any): boolean => {
  const validate = ajv.compile(schema);
  const valid = validate(specObject);

  if (!valid) {
    console.error('Validation errors:', validate.errors);
  }

  return valid;
};

const generateNewResourceName = (namespace: string, kind: string) => {
  const randomString = crypto.randomBytes(4).toString('hex');
  return `${namespace}-${kind.toLowerCase()}-${randomString}`;
}

export const createCustomResourceInstance = async (resource: any, providedValues: any, namespace: string) => {
  const adjustedValues = adjustProvidedValues(resource.openApiSchema, providedValues);
  // Validate the adjusted values
  if (validateSpecObject(resource.openApiSchema, adjustedValues)) {
    // Proceed to create the custom resource instance
    const customResource = {
      apiVersion: `${resource.group}/${resource.version}`,
      kind: resource.kind,
      metadata: {
        name: generateNewResourceName(namespace, resource.kind),
        namespace: namespace,
      },
      ...adjustedValues,
    };
    return customResource;
  } else {
    throw new Error('Provided values failed resoruce open api schema validation.');
  }
}