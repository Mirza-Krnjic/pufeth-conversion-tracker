import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PufETH Conversion Rate API',
      version: '1.0.0',
      description: 'API for tracking PufETH conversion rates',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 