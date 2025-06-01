const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Swagger configuration options
 * @type {import('swagger-jsdoc').Options}
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wanderly API',
      version: '1.0.0',
      description: 'API documentation for Wanderly travel social network',
      contact: {
        name: 'API Support',
        email: 'support@wanderly.com',
        url: 'https://wanderly.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.wanderly.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
              description: 'User email address',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123',
              description: 'User password (min 6 characters)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
              description: 'Auto-generated creation timestamp',
            },
          },
        },
        Post: {
          type: 'object',
          required: ['title', 'content', 'author'],
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 100,
              example: 'My Paris Adventure',
              description: 'Post title',
            },
            content: {
              type: 'string',
              minLength: 10,
              example: 'The Eiffel Tower was amazing!',
              description: 'Post content',
            },
            location: {
              type: 'string',
              example: 'Paris, France',
              description: 'Location associated with the post',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
                example: 'travel',
              },
              maxItems: 10,
              description: 'Post tags',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
                example: 'https://example.com/image.jpg',
              },
              maxItems: 10,
              description: 'Post images URLs',
            },
            author: {
              type: 'string',
              format: 'ObjectId',
              example: '507f1f77bcf86cd799439011',
              description: 'Reference to User who created the post',
            },
            likes: {
              type: 'array',
              items: {
                type: 'string',
                format: 'ObjectId',
              },
              description: 'Array of User IDs who liked the post',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'integer',
              example: 400,
            },
            message: {
              type: 'string',
              example: 'Error description',
            },
            errors: {
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
              example: {
                email: 'Invalid email format',
                password: 'Password must be 6+ characters',
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid authentication token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                statusCode: 401,
                message: 'Not authorized',
              },
            },
          },
        },
        NotFound: {
          description: 'Requested resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                statusCode: 404,
                message: 'Post not found',
              },
            },
          },
        },
        ValidationError: {
          description: 'Request data validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                statusCode: 400,
                message: 'Validation failed',
                errors: {
                  email: 'Invalid email format',
                  password: 'Password must be 6+ characters',
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

module.exports = swaggerJsdoc(options);
