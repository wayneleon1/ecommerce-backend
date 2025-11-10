import request from "supertest";
import express from "express";
import productRoutes from "../routes/product.routes";
import { db } from "../db";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use("/products", productRoutes);

describe("Product Endpoints", () => {
  const adminToken = jwt.sign(
    { userId: "123", username: "admin", role: "admin" },
    process.env.JWT_SECRET!
  );

  const userToken = jwt.sign(
    { userId: "456", username: "user", role: "user" },
    process.env.JWT_SECRET!
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /products", () => {
    it("should get all products with pagination", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Product 1",
          description: "Description 1",
          price: "10.00",
          stock: 100,
          category: "Electronics",
        },
      ];

      // Mock the complete query chain for fetching products
      const mockDataQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(mockProducts),
      };

      // Mock the count query chain
      const mockCountQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ count: 1 }]),
      };

      // Setup db.select to return different mocks for each call
      (db.select as jest.Mock)
        .mockReturnValueOnce(mockDataQuery) // First: products query
        .mockReturnValueOnce(mockCountQuery); // Second: count query

      const response = await request(app).get("/products?page=1&pageSize=10");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.object).toBeInstanceOf(Array);
      expect(response.body.object.length).toBeGreaterThan(0);
      expect(response.body.pageNumber).toBe(1);
      expect(response.body.pageSize).toBe(10);
    });

    it("should search products by name", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Laptop",
          description: "High-end laptop",
          price: "999.99",
          stock: 50,
          category: "Electronics",
        },
      ];

      // Mock data query with search filter
      const mockDataQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(mockProducts),
      };

      // Mock count query with search filter
      const mockCountQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ count: 1 }]),
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(mockDataQuery)
        .mockReturnValueOnce(mockCountQuery);

      const response = await request(app).get(
        "/products?page=1&pageSize=10&search=Laptop"
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.object).toBeInstanceOf(Array);
    });
  });

  describe("GET /products/:id", () => {
    it("should get a product by id", async () => {
      const mockProduct = {
        id: "123",
        name: "Test Product",
        price: "99.99",
      };

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockProduct]),
          }),
        }),
      });

      (db.select as jest.Mock) = mockSelect;

      const response = await request(app).get("/products/123");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.object).toHaveProperty("name", "Test Product");
    });

    it("should return 404 for non-existent product", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (db.select as jest.Mock) = mockSelect;

      const response = await request(app).get("/products/999");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /products", () => {
    it("should create a product as admin", async () => {
      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: "1",
              name: "New Product",
              price: "99.99",
              stock: 50,
            },
          ]),
        }),
      });

      (db.insert as jest.Mock) = mockInsert;

      const response = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New Product",
          description: "A great product description",
          price: 99.99,
          stock: 50,
          category: "Electronics",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it("should fail without admin token", async () => {
      const response = await request(app).post("/products").send({
        name: "New Product",
        description: "A great product",
        price: 99.99,
        stock: 50,
        category: "Electronics",
      });

      expect(response.status).toBe(401);
    });

    it("should fail with user role (not admin)", async () => {
      const response = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "New Product",
          description: "A great product",
          price: 99.99,
          stock: 50,
          category: "Electronics",
        });

      expect(response.status).toBe(403);
    });

    it("should fail with invalid data", async () => {
      const response = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "AB", // Too short
          description: "Short",
          price: -10, // Negative
          stock: 50,
          category: "Electronics",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /products/:id", () => {
    it("should update a product as admin", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: "1", name: "Old Name" }]),
          }),
        }),
      });

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              {
                id: "1",
                name: "Updated Product",
                price: "149.99",
              },
            ]),
          }),
        }),
      });

      (db.select as jest.Mock) = mockSelect;
      (db.update as jest.Mock) = mockUpdate;

      const response = await request(app)
        .put("/products/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Product",
          price: 149.99,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 404 for non-existent product", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (db.select as jest.Mock) = mockSelect;

      const response = await request(app)
        .put("/products/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Product",
        });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete a product as admin", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: "1" }]),
          }),
        }),
      });

      const mockDelete = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      (db.select as jest.Mock) = mockSelect;
      (db.delete as jest.Mock) = mockDelete;

      const response = await request(app)
        .delete("/products/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 404 for non-existent product", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (db.select as jest.Mock) = mockSelect;

      const response = await request(app)
        .delete("/products/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
