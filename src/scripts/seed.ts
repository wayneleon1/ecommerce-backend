import { db } from "../db";
import { users, products } from "../db/schema";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...\n");

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@ecommerce.com"))
      .limit(1);

    let admin;
    if (existingAdmin.length > 0) {
      console.log("ℹ️  Admin user already exists, skipping...");
      admin = existingAdmin[0];
    } else {
      // Create admin user
      console.log("👤 Creating admin user...");
      const adminPassword = await bcrypt.hash("Admin123!@#", 10);
      [admin] = await db
        .insert(users)
        .values({
          username: "admin",
          email: "admin@ecommerce.com",
          password: adminPassword,
          role: "admin",
        })
        .returning();
      console.log("✅ Admin user created successfully");
      console.log("   Email: admin@ecommerce.com");
      console.log("   Password: Admin123!@#");
      console.log("   Role: admin\n");
    }

    // Check if test user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "user@ecommerce.com"))
      .limit(1);

    let user;
    if (existingUser.length > 0) {
      console.log("ℹ️  Test user already exists, skipping...");
      user = existingUser[0];
    } else {
      // Create regular test user
      console.log("👤 Creating test user...");
      const userPassword = await bcrypt.hash("User123!@#", 10);
      [user] = await db
        .insert(users)
        .values({
          username: "testuser",
          email: "user@ecommerce.com",
          password: userPassword,
          role: "user",
        })
        .returning();
      console.log("✅ Test user created successfully");
      console.log("   Email: user@ecommerce.com");
      console.log("   Password: User123!@#");
      console.log("   Role: user\n");
    }

    // Check if products already exist
    const existingProducts = await db.select().from(products).limit(1);

    if (existingProducts.length > 0) {
      console.log("ℹ️  Products already exist, skipping...\n");
    } else {
      // Create sample products
      console.log("📦 Creating sample products...");
      const sampleProducts = [
        {
          name: 'MacBook Pro 16"',
          description:
            "Powerful laptop with M3 Pro chip, 18GB unified memory, and 512GB SSD. Perfect for developers and creative professionals.",
          price: "2499.99",
          stock: 25,
          category: "Electronics",
          userId: admin.id,
        },
        {
          name: "iPhone 15 Pro",
          description:
            "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. 256GB storage.",
          price: "1199.99",
          stock: 50,
          category: "Electronics",
          userId: admin.id,
        },
        {
          name: "AirPods Pro (2nd Gen)",
          description:
            "Premium wireless earbuds with active noise cancellation and spatial audio support.",
          price: "249.99",
          stock: 100,
          category: "Accessories",
          userId: admin.id,
        },
        {
          name: "Magic Mouse",
          description:
            "Wireless rechargeable mouse with Multi-Touch surface for gesture controls.",
          price: "79.99",
          stock: 150,
          category: "Accessories",
          userId: admin.id,
        },
        {
          name: "Magic Keyboard",
          description:
            "Wireless keyboard with improved scissor mechanism and rechargeable battery.",
          price: "99.99",
          stock: 120,
          category: "Accessories",
          userId: admin.id,
        },
        {
          name: "iPad Air",
          description:
            "10.9-inch Liquid Retina display with M1 chip. 64GB storage with Wi-Fi.",
          price: "599.99",
          stock: 75,
          category: "Electronics",
          userId: admin.id,
        },
        {
          name: "Apple Watch Series 9",
          description:
            "Smartwatch with advanced health features, always-on display, and GPS.",
          price: "399.99",
          stock: 80,
          category: "Wearables",
          userId: admin.id,
        },
        {
          name: "USB-C to USB-C Cable",
          description:
            "Durable 2-meter charging cable supporting fast charging and data transfer.",
          price: "19.99",
          stock: 300,
          category: "Accessories",
          userId: admin.id,
        },
        {
          name: "Studio Display",
          description:
            "27-inch 5K Retina display with 12MP Ultra Wide camera and six-speaker sound system.",
          price: "1599.99",
          stock: 20,
          category: "Electronics",
          userId: admin.id,
        },
        {
          name: "HomePod mini",
          description:
            "Compact smart speaker with rich 360-degree audio and Siri integration.",
          price: "99.99",
          stock: 90,
          category: "Audio",
          userId: admin.id,
        },
      ];

      await db.insert(products).values(sampleProducts);
      console.log(`✅ Created ${sampleProducts.length} sample products\n`);
    }

    console.log("🎉 Database seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
