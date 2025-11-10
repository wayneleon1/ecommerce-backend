import request from "supertest";
import express from "express";
import orderRoutes from "../routes/order.routes";
import { db } from "../db";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use("/orders", orderRoutes);

describe("Order Endpoints", () => {
  const userToken = jwt.sign(
    { userId: "123", username: "user", role: "user" },
    process.env.JWT_SECRET!
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /orders", () => {
    it("should create an order successfully", async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([
                {
                  id: "p1",
                  name: "Product 1",
                  price: "10.00",
                  stock: 100,
                },
              ]),
            }),
          }),
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([
                {
                  id: "o1",
                  totalPrice: "20.00",
                  status: "pending",
                  userId: "123",
                },
              ]),
            }),
          }),
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(undefined),
            }),
          }),
        };
        return callback(tx);
      });

      (db.transaction as jest.Mock) = mockTransaction;

      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send([{ productId: "p1", quantity: 2 }]);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.object).toHaveProperty("totalPrice");
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .post("/orders")
        .send([{ productId: "p1", quantity: 2 }]);

      expect(response.status).toBe(401);
    });

    it("should fail with invalid product id", async () => {
      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send([{ productId: "invalid-uuid", quantity: 2 }]);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail with insufficient stock", async () => {
      const mockTransaction = jest
        .fn()
        .mockRejectedValue(new Error("Insufficient stock for Product 1"));

      (db.transaction as jest.Mock) = mockTransaction;

      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send([
          { productId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", quantity: 1000 },
        ]);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /orders", () => {
    it("should get user orders", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              id: "o1",
              totalPrice: "20.00",
              status: "pending",
              userId: "123",
            },
          ]),
        }),
      });

      (db.select as jest.Mock) = mockSelect;

      const response = await request(app)
        .get("/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.object).toBeInstanceOf(Array);
    });

    it("should fail without authentication", async () => {
      const response = await request(app).get("/orders");

      expect(response.status).toBe(401);
    });

    it("should return empty array for user with no orders", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      (db.select as jest.Mock) = mockSelect;

      const response = await request(app)
        .get("/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.object).toEqual([]);
    });
  });
});
