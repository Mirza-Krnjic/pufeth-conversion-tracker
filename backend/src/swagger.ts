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
  },
  apis: ['./src/server.ts'],
}); 