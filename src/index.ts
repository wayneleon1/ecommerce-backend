import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { cache } from "./services/cache";
import { generalLimiter } from "./middleware/rateLimiter.middleware";
import { initializeDatabase } from "./db/init";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(generalLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errors: ["The requested endpoint does not exist"],
  });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [err.message],
    });
  }
);

// Start server
const startServer = async () => {
  try {
    // Initialize database connection
    const dbConnected = await initializeDatabase();
    if (!dbConnected) {
      throw new Error("Database connection failed");
    }

    // Connect to Redis
    try {
      console.log("🔌 Connecting to Redis...");
      await cache.connect();
      console.log("✅ Redis connected successfully");
    } catch (redisError) {
      console.warn("⚠️  Redis connection failed - continuing without cache");
    }

    app.listen(PORT, () => {
      console.log("\n🎉 Server started successfully!");
      console.log("================================");
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");

  // Close database connection
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

startServer();

export default app;
