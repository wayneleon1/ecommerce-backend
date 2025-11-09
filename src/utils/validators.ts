import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*]/,
      "Password must contain at least one special character"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const createProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().nonnegative("Stock must be non-negative"),
  category: z.string().min(1, "Category is required"),
});

export const updateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  category: z.string().min(1).optional(),
});

export const createOrderSchema = z.array(
  z.object({
    productId: z.string().uuid("Invalid product ID"),
    quantity: z.number().int().positive("Quantity must be positive"),
  })
);

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  search: z.string().optional(),
});
