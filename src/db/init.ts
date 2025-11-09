import { db } from ".";
import { sql } from "drizzle-orm";

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log("🔌 Connecting to database...");

    // Test database connection
    await db.execute(sql`SELECT 1`);

    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
};
