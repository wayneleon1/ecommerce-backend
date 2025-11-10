import swaggerJsdoc from "swagger-jsdoc";
import { authSwaggerDocs } from "../docs/auth.swagger";
import { productSwaggerDocs } from "../docs/product.swagger";
import { orderSwaggerDocs } from "../docs/order.swagger";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description:
        "A comprehensive REST API for an e-commerce platform with authentication, product management, and order processing.",
      contact: {
        name: "Leon Rurangwa",
        email: "rurangwaleon10@gmail.com",
        url: "https://github.com/wayneleon1/",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.ecommerce.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "string",
              },
              nullable: true,
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
            },
            object: {
              type: "object",
            },
            errors: {
              type: "null",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication and authorization endpoints",
      },
      {
        name: "Products",
        description: "Product management endpoints (CRUD operations)",
      },
      {
        name: "Orders",
        description: "Order management and history endpoints",
      },
    ],
    paths: {
      ...authSwaggerDocs,
      ...productSwaggerDocs,
      ...orderSwaggerDocs,
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
