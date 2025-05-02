import swaggerJsdoc from 'swagger-jsdoc';

const port = process.env.PORT || 3000;

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'pufETH Conversion Rate API',
      version: '1.0.0',
      description: 'API for tracking pufETH conversion rates',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        ConversionRate: {
          type: 'object',
          properties: {
            rate: {
              type: 'number',
              description: 'Current pufETH conversion rate'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of the rate'
            },
            change: {
              type: 'number',
              description: 'Change from previous rate'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./src/server.ts'],
}); 