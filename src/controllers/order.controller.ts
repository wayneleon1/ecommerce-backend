import { Request, Response } from 'express';
import { db } from '../db';
import { orders, orderItems, products } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user!;
    const items = req.body;

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Get all products
      const productIds = items.map((item: any) => item.productId);
      const productsList = await tx.select().from(products).where(inArray(products.id, productIds));

      if (productsList.length !== productIds.length) {
        throw new Error('One or more products not found');
      }

      // Check stock and calculate total
      let totalPrice = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = productsList.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const itemPrice = parseFloat(product.price) * item.quantity;
        totalPrice += itemPrice;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });

        // Update stock
        await tx.update(products)
          .set({ stock: product.stock - item.quantity })
          .where(eq(products.id, product.id));
      }

      // Create order
      const [order] = await tx.insert(orders).values({
        userId: user.userId,
        totalPrice: totalPrice.toString(),
        status: 'pending',
        description: `Order with ${items.length} items`,
      }).returning();

      // Create order items
      const itemsToInsert = orderItemsData.map(item => ({
        ...item,
        orderId: order.id,
      }));

      await tx.insert(orderItems).values(itemsToInsert);

      return order;
    });

    return sendSuccess(res, 'Order placed successfully', result, 201);
  } catch (error: any) {
    console.error('Create order error:', error);
    if (error.message.includes('not found')) {
      return sendError(res, 'Order creation failed', [error.message], 404);
    }
    if (error.message.includes('Insufficient stock')) {
      return sendError(res, 'Order creation failed', [error.message], 400);
    }
    return sendError(res, 'Failed to create order', ['Internal server error'], 500);
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user!;

    const userOrders = await db.select().from(orders).where(eq(orders.userId, user.userId));

    return sendSuccess(res, 'Orders retrieved successfully', userOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    return sendError(res, 'Failed to retrieve orders', ['Internal server error'], 500);
  }
};