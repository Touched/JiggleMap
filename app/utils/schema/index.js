import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import * as typeSchemas from './types';
import * as entityDataSchemas from './entities';

const ajv = new Ajv({
  $data: true,
  schemas: typeSchemas,
});

ajvKeywords(ajv);

export function buildEntitySchema(entityType, dataSchema) {
  return ajv.compile({
    id: `http://example.com/schema/entity/${entityType}`,
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
                const: entityType,
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

export default Object.keys(entityDataSchemas).reduce((validators, type) => ({
  ...validators,
  [type]: buildEntitySchema(type, entityDataSchemas[type]),
}), {});
