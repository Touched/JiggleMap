
import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import * as typeSchemas from './types';
import * as resourceDataSchemas from './resources';

const ajv = new Ajv({
  $data: true,
  schemas: typeSchemas,
});

ajvKeywords(ajv);

export function buildResourceSchema(resourceType, dataSchema) {
  return ajv.compile({
    id: `http://example.com/schema/resource/${resourceType}`,
    type: 'object',
    required: ['meta', 'data'],
    additionalProperties: false,
    properties: {
      meta: {
        type: 'object',
        required: ['format', 'id'],
        properties: {
          format: {
            type: 'object',
            additionalProperties: false,
            required: ['type', 'version'],
            properties: {
              type: {
                type: 'string',
                const: resourceType,
              },
              version: {
                type: 'string',
                const: '1.0.0',
              },
            },
          },
          id: {
            type: 'string',
            pattern: '^[a-z][-a-z0-9]+$',
          },
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
        },
      },
      data: dataSchema,
    },
  });
}

export default Object.keys(resourceDataSchemas).reduce((validators, type) => ({
  ...validators,
  [type]: buildResourceSchema(type, resourceDataSchemas[type]),
}), {});
