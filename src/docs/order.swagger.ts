export const orderSwaggerDocs = {
  "/orders": {
    post: {
      tags: ["Orders"],
      summary: "Place a new order",
      description:
        "Create a new order with multiple products. Stock is checked and updated in a transaction.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                  productId: {
                    type: "string",
                    format: "uuid",
                    description: "Product ID",
                    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                  },
                  quantity: {
                    type: "integer",
                    minimum: 1,
                    description: "Quantity to order",
                    example: 2,
                  },
                },
              },
              example: [
                {
                  productId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                  quantity: 2,
                },
                {
                  productId: "b2c3d4e5-f678-90ab-cdef-123456789012",
                  quantity: 1,
                },
              ],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Order placed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Order placed successfully",
                  },
                  object: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      userId: { type: "string", format: "uuid" },
                      totalPrice: { type: "string", example: "159.98" },
                      status: { type: "string", example: "pending" },
                      description: {
                        type: "string",
                        example: "Order with 2 items",
                      },
                      createdAt: { type: "string", format: "date-time" },
                    },
                  },
                  errors: { type: "null" },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error or insufficient stock",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              examples: {
                insufficientStock: {
                  value: {
                    success: false,
                    message: "Order creation failed",
                    errors: ["Insufficient stock for Product X"],
                  },
                },
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
    get: {
      tags: ["Orders"],
      summary: "Get my order history",
      description: "Retrieve all orders for the authenticated user.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Orders retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Orders retrieved successfully",
                  },
                  object: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        userId: { type: "string", format: "uuid" },
                        totalPrice: { type: "string", example: "159.98" },
                        status: { type: "string", example: "pending" },
                        description: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  errors: { type: "null" },
                },
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
      },
    },
  },
};
