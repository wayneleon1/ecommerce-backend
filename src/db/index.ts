import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const client = postgres(connectionString, {
  ssl: "prefer",
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false,
  onnotice: () => {},
  debug: process.env.NODE_ENV === "development",
});

export const db = drizzle(client, { schema });
