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

export const createCustomResourceInstance = async (resourceType: ResourceType, providedValues: any): Promise<ApiObject> => {

  if (validateSpecObject(resourceType.openApiSchema, providedValues)) {
    const namespace = providedValues.metadata?.namespace || "default";
    const name = providedValues.metadata?.name || generateNewResourceName(namespace, resourceType.kind);
    const metadata = {
      ...providedValues.metadata,
      name: name,
      namespace: namespace,
    };
    delete providedValues.metadata;
    return {
      apiVersion: `${resourceType.group}/${resourceType.version}`,
      kind: resourceType.kind,
      metadata,
      // incase of edit, providedValues will contain the existing resource propreties and override the above updates
      ...providedValues,
    };
  } else {
    throw new Error('Schema validation failed.');
  }
}