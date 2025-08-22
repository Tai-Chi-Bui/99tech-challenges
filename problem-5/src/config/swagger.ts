import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Animal CRUD API',
      description: 'A complete CRUD API for managing animal resources',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [{ name: 'Animals', description: 'Animal management endpoints' }],
    components: {
      schemas: {
        Animal: { 
          type: 'object', 
          properties: { 
            id: { type: 'integer', description: 'Unique identifier' }, 
            name: { type: 'string', description: 'Animal name' }, 
            species: { type: 'string', description: 'Animal species' },
            breed: { type: 'string', description: 'Animal breed' },
            age: { type: 'integer', description: 'Animal age in years', minimum: 0, maximum: 50 },
            size: { type: 'string', enum: ['small', 'medium', 'large'], description: 'Animal size category' },
            location: { type: 'string', description: 'Animal location' },
            description: { type: 'string', description: 'Additional description' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
          },
          required: ['id', 'name', 'species', 'createdAt', 'updatedAt']
        },
        CreateAnimalRequest: { 
          type: 'object', 
          required: ['name', 'species'], 
          properties: { 
            name: { type: 'string', description: 'Animal name' }, 
            species: { type: 'string', description: 'Animal species' },
            breed: { type: 'string', description: 'Animal breed' },
            age: { type: 'integer', description: 'Animal age in years', minimum: 0, maximum: 50 },
            size: { type: 'string', enum: ['small', 'medium', 'large'], description: 'Animal size category' },
            location: { type: 'string', description: 'Animal location' },
            description: { type: 'string', description: 'Additional description' }
          } 
        },
        UpdateAnimalRequest: { 
          type: 'object', 
          properties: { 
            name: { type: 'string', description: 'Animal name' }, 
            species: { type: 'string', description: 'Animal species' },
            breed: { type: 'string', description: 'Animal breed' },
            age: { type: 'integer', description: 'Animal age in years', minimum: 0, maximum: 50 },
            size: { type: 'string', enum: ['small', 'medium', 'large'], description: 'Animal size category' },
            location: { type: 'string', description: 'Animal location' },
            description: { type: 'string', description: 'Additional description' }
          } 
        },
        ApiResponse: { 
          type: 'object', 
          properties: { 
            success: { type: 'boolean', description: 'Operation success status' }, 
            data: { description: 'Response data' }, 
            message: { type: 'string', description: 'Success message' },
            timestamp: { type: 'string', format: 'date-time', description: 'Response timestamp' }
          },
          required: ['success', 'timestamp']
        },
        PaginatedResponse: { 
          type: 'object', 
          properties: { 
            success: { type: 'boolean', description: 'Operation success status' },
            data: { 
              type: 'array', 
              items: { $ref: '#/components/schemas/Animal' },
              description: 'Array of animals'
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', description: 'Total number of animals' },
                limit: { type: 'integer', description: 'Number of results per page' },
                offset: { type: 'integer', description: 'Number of results skipped' },
                hasMore: { type: 'boolean', description: 'Whether there are more results' }
              },
              required: ['total', 'limit', 'offset', 'hasMore']
            },
            timestamp: { type: 'string', format: 'date-time', description: 'Response timestamp' }
          },
          required: ['success', 'data', 'pagination', 'timestamp']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Operation success status' },
            error: { type: 'string', description: 'Error type' },
            message: { type: 'string', description: 'Error message' },
            timestamp: { type: 'string', format: 'date-time', description: 'Response timestamp' },
            path: { type: 'string', description: 'Request path' }
          },
          required: ['success', 'error', 'message', 'timestamp']
        }
      }
    }
  },
  apis: [path.join(__dirname, '../routes/*.ts')]
};

const specs = swaggerJsdoc(options);
const outputFile = path.join(__dirname, '../../swagger-output.json');

fs.writeFileSync(outputFile, JSON.stringify(specs, null, 2));
console.log('Swagger docs generated with swagger-jsdoc!');
