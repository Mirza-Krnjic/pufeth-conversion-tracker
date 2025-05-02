declare module 'swagger-jsdoc' {
  interface Options {
    definition: {
      openapi: string;
      info: {
        title: string;
        version: string;
        description?: string;
      };
      servers?: Array<{
        url: string;
        description?: string;
      }>;
      components?: {
        schemas?: {
          [key: string]: {
            type: string;
            properties?: {
              [key: string]: {
                type: string;
                format?: string;
                description?: string;
                example?: any;
              };
            };
          };
        };
      };
    };
    apis: string[];
  }

  function swaggerJsdoc(options: Options): any;
  export = swaggerJsdoc;
} 