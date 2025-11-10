import request from "supertest";
import express from "express";
import authRoutes from "../routes/auth.routes";
import { db } from "../db";
import bcrypt from "bcrypt";

// Create a separate app instance for testing
const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      // Mock empty result (user doesn't exist)
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Mock user creation
      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: "123e4567-e89b-12d3-a456-426614174000",
              username: "testuser",
              email: "test@example.com",
              role: "user",
              createdAt: new Date(),
            },
          ]),
        }),
      });

      (db.select as jest.Mock) = mockSelect;
      (db.insert as jest.Mock) = mockInsert;

      const response = await request(app).post("/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "Test123!@#",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.object).toHaveProperty("username", "testuser");
      expect(response.body.object).not.toHaveProperty("password");
    });

    it("should fail with invalid email", async () => {
      const response = await request(app).post("/auth/register").send({
        username: "testuser",
        email: "invalid-email",
        password: "Test123!@#",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("should fail with weak password", async () => {
      const response = await request(app).post("/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "weak",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("should fail with non-alphanumeric username", async () => {
      const response = await request(app).post("/auth/register").send({
        username: "test user!",
        email: "test@example.com",
        password: "Test123!@#",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail when email already exists", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest
              .fn()
              .mockResolvedValue([{ id: "123", email: "test@example.com" }]),
          }),
        }),
      });

      (db.select as jest.Mock) = mockSelect;

      const response = await request(app).post("/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "Test123!@#",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("Test123!@#", 10);

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                id: "123e4567-e89b-12d3-a456-426614174000",
                username: "testuser",
                email: "test@example.com",
                password: hashedPassword,
                role: "user",
              },
            ]),
          }),
        }),
      });

      (db.select as jest.Mock) = mockSelect;

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "Test123!@#",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.object).toHaveProperty("token");
      expect(response.body.object).toHaveProperty("user");
      expect(response.body.object.user).not.toHaveProperty("password");
    });

    it("should fail with non-existent email", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (db.select as jest.Mock) = mockSelect;

      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "Test123!@#",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail with incorrect password", async () => {
      const hashedPassword = await bcrypt.hash("CorrectPassword123!", 10);

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                id: "123",
                email: "test@example.com",
                password: hashedPassword,
              },
            ]),
          }),
        }),
      });

      (db.select as jest.Mock) = mockSelect;

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "WrongPassword123!",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid email format", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "invalid-email",
        password: "Test123!@#",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
