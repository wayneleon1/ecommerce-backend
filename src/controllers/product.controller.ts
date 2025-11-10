import { Request, Response } from "express";
import { db } from "../db";
import { products, users } from "../db/schema";
import { eq, ilike, and, sql } from "drizzle-orm";
import { AuthRequest } from "../types";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { cache } from "../services/cache";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user!;
    const { name, description, price, stock, category } = req.body;

    const [product] = await db
      .insert(products)
      .values({
        name,
        description,
        price: price.toString(),
        stock,
        category,
        userId: user.userId,
      })
      .returning();

    // Clear cache
    await cache.del("products:list");

    return sendSuccess(res, "Product created successfully", product, 201);
  } catch (error) {
    console.error("Create product error:", error);
    return sendError(
      res,
      "Failed to create product",
      ["Internal server error"],
      500
    );
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!existing) {
      return sendError(res, "Product not found", null, 404);
    }

    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.price) updateData.price = updates.price.toString();
    if (updates.stock !== undefined) updateData.stock = updates.stock;
    if (updates.category) updateData.category = updates.category;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    // Clear cache
    await cache.del("products:list");
    await cache.del(`product:${id}`);

    return sendSuccess(res, "Product updated successfully", updated);
  } catch (error) {
    console.error("Update product error:", error);
    return sendError(
      res,
      "Failed to update product",
      ["Internal server error"],
      500
    );
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, search } = req.query as any;
    const offset = (page - 1) * pageSize;

    // Check cache
    const cacheKey = `products:list:${page}:${pageSize}:${search || ""}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    let query = db.select().from(products);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(products);

    if (search) {
      const searchCondition = ilike(products.name, `%${search}%`);
      query = query.where(searchCondition) as any;
      countQuery = countQuery.where(searchCondition) as any;
    }

    const [{ count }] = await countQuery;
    const items = await query.limit(pageSize).offset(offset);

    const response = {
      success: true,
      message: "Products retrieved successfully",
      object: items,
      pageNumber: page,
      pageSize,
      totalSize: Number(count),
      errors: null,
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, response, 300);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Get products error:", error);
    return sendError(
      res,
      "Failed to retrieve products",
      ["Internal server error"],
      500
    );
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check cache
    const cacheKey = `product:${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return sendSuccess(res, "Product retrieved successfully", cached);
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return sendError(res, "Product not found", null, 404);
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, product, 300);

    return sendSuccess(res, "Product retrieved successfully", product);
  } catch (error) {
    console.error("Get product error:", error);
    return sendError(
      res,
      "Failed to retrieve product",
      ["Internal server error"],
      500
    );
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!existing) {
      return sendError(res, "Product not found", null, 404);
    }

    await db.delete(products).where(eq(products.id, id));

    // Clear cache
    await cache.del("products:list");
    await cache.del(`product:${id}`);

    return sendSuccess(res, "Product deleted successfully");
  } catch (error) {
    console.error("Delete product error:", error);
    return sendError(
      res,
      "Failed to delete product",
      ["Internal server error"],
      500
    );
  }
};
