import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { initDB } from "./db/init";
import { cache } from "./services/cache";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

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
    // Connect to DB
    await initDB();

    // Connect to Redis
    await cache.connect();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(
        `Drizzle Studio available at http://localhost:${PORT}/drizzle`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
