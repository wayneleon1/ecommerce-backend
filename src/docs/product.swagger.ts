export const productSwaggerDocs = {
  "/products": {
    get: {
      tags: ["Products"],
      summary: "Get all products",
      description:
        "Retrieve a paginated list of products with optional search functionality.",
      parameters: [
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
          description: "Page number",
        },
        {
          in: "query",
          name: "pageSize",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10,
          },
          description: "Number of items per page",
        },
        {
          in: "query",
          name: "search",
          schema: {
            type: "string",
          },
          description:
            "Search products by name (case-insensitive, partial match)",
        },
      ],

      responses: {
        200: {
          description: "Products retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Products retrieved successfully",
                  },
                  object: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string", example: "Laptop Pro 15" },
                        description: {
                          type: "string",
                          example: "High-performance laptop",
                        },
                        price: { type: "string", example: "1299.99" },
                        stock: { type: "integer", example: 50 },
                        category: { type: "string", example: "Electronics" },
                        userId: { type: "string", format: "uuid" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  pageNumber: { type: "integer", example: 1 },
                  pageSize: { type: "integer", example: 10 },
                  totalSize: { type: "integer", example: 100 },
                  errors: { type: "null" },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Products"],
      summary: "Create a new product",
      description: "Create a new product (Admin only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "description", "price", "stock", "category"],
              properties: {
                name: {
                  type: "string",
                  minLength: 3,
                  maxLength: 100,
                  example: "Wireless Mouse",
                },
                description: {
                  type: "string",
                  minLength: 10,
                  example: "Ergonomic wireless mouse with precision tracking",
                },
                price: {
                  type: "number",
                  minimum: 0.01,
                  example: 29.99,
                },
                stock: {
                  type: "integer",
                  minimum: 0,
                  example: 100,
                },
                category: {
                  type: "string",
                  example: "Accessories",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Product created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product created successfully",
                  },
                  object: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      name: { type: "string" },
                      description: { type: "string" },
                      price: { type: "string" },
                      stock: { type: "integer" },
                      category: { type: "string" },
                      userId: { type: "string", format: "uuid" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                  errors: { type: "null" },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        403: {
          description: "Forbidden - Admin access required",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
  },
  "/products/{id}": {
    get: {
      tags: ["Products"],
      summary: "Get product by ID",
      description: "Retrieve detailed information about a specific product.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
            format: "uuid",
          },
          description: "Product ID",
        },
      ],
      responses: {
        200: {
          description: "Product retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product retrieved successfully",
                  },
                  object: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      name: { type: "string" },
                      description: { type: "string" },
                      price: { type: "string" },
                      stock: { type: "integer" },
                      category: { type: "string" },
                      userId: { type: "string", format: "uuid" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                  errors: { type: "null" },
                },
              },
            },
          },
        },
        404: {
          description: "Product not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
    put: {
      tags: ["Products"],
      summary: "Update a product",
      description: "Update an existing product (Admin only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
            format: "uuid",
          },
          description: "Product ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  minLength: 3,
                  maxLength: 100,
                },
                description: {
                  type: "string",
                  minLength: 10,
                },
                price: {
                  type: "number",
                  minimum: 0.01,
                },
                stock: {
                  type: "integer",
                  minimum: 0,
                },
                category: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Product updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Success",
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        403: {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        404: {
          description: "Product not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Products"],
      summary: "Delete a product",
      description: "Delete a product from the catalog (Admin only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
            format: "uuid",
          },
          description: "Product ID",
        },
      ],
      responses: {
        200: {
          description: "Product deleted successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Success",
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        403: {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        404: {
          description: "Product not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
  },
};
