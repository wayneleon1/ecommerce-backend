export const authSwaggerDocs = {
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a new user",
      description:
        "Create a new user account with username, email, and password. Password must meet security requirements.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email", "password"],
              properties: {
                username: {
                  type: "string",
                  description: "Alphanumeric username (no special characters)",
                  example: "johndoe",
                  minLength: 3,
                },
                email: {
                  type: "string",
                  format: "email",
                  description: "Valid email address",
                  example: "john@example.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  description:
                    "Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)",
                  example: "Password123!",
                  minLength: 8,
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "User registered successfully",
                  },
                  object: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      username: { type: "string", example: "johndoe" },
                      email: { type: "string", example: "john@example.com" },
                      role: { type: "string", example: "user" },
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
          description: "Validation error or user already exists",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              examples: {
                validationError: {
                  value: {
                    success: false,
                    message: "Validation failed",
                    errors: ["Password must be at least 8 characters"],
                  },
                },
                duplicateEmail: {
                  value: {
                    success: false,
                    message: "Registration failed",
                    errors: ["Email already registered"],
                  },
                },
              },
            },
          },
        },
        429: {
          description: "Too many requests",
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
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login user",
      description:
        "Authenticate user with email and password. Returns JWT token on success.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  description: "User email address",
                  example: "john@example.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  description: "User password",
                  example: "Password123!",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Login successful" },
                  object: {
                    type: "object",
                    properties: {
                      token: {
                        type: "string",
                        description: "JWT token for authentication",
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          username: { type: "string", example: "johndoe" },
                          email: {
                            type: "string",
                            example: "john@example.com",
                          },
                          role: { type: "string", example: "user" },
                        },
                      },
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
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                success: false,
                message: "Login failed",
                errors: ["Invalid credentials"],
              },
            },
          },
        },
        429: {
          description: "Too many login attempts",
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
