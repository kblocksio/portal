import Ajv, { SchemaObject } from 'ajv';
import crypto from 'crypto';
import { ResourceType } from '../../../packages/shared/src/types';
import { ApiObject } from '@kblocks/cli/src/api';

const ajv = new Ajv({ allErrors: true, strict: false });

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

export const createCustomResourceInstance = async (resource: ResourceType, providedValues: any, namespace: string): Promise<ApiObject> => {
  // Validate the adjusted values
  if (validateSpecObject(resource.openApiSchema, providedValues)) {
    // Proceed to create the custom resource instance
    return {
      apiVersion: `${resource.group}/${resource.version}`,
      kind: resource.kind,
      metadata: {
        name: generateNewResourceName(namespace, resource.kind),
        namespace: namespace,
      },
      ...providedValues,
    };
  } else {
    throw new Error('Schema validation failed.');
  }
}