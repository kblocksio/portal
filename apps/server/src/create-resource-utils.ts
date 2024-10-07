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

export const createCustomResourceInstance = async (resource: ResourceType, providedValues: any): Promise<ApiObject> => {

  if (validateSpecObject(resource.openApiSchema, providedValues)) {
    const namespace = providedValues.metadata?.namespace || "default";
    const name = providedValues.metadata?.name || generateNewResourceName(namespace, resource.kind);
    delete providedValues.metadata.namespace;
    delete providedValues.metadata.name;
    return {
      apiVersion: `${resource.group}/${resource.version}`,
      kind: resource.kind,
      metadata: {
        name: name,
        namespace: namespace,
      },
      // incase of edit, providedValues will contain the existing resource propreties and override the above updates
      ...providedValues,
    };
  } else {
    throw new Error('Schema validation failed.');
  }
}