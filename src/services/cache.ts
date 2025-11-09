import { createClient } from "redis";

class CacheService {
  private client;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.client.on("error", (err) => console.log("Redis Client Error", err));
    this.client.on("connect", () => {
      this.isConnected = true;
      console.log("Redis connected");
    });
  }

  async connect() {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async get(key: string): Promise<any> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }
}

export const cache = new CacheService();
