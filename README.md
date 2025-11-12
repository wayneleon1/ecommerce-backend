# E-commerce REST API

A comprehensive REST API for an e-commerce platform built with Node.js, TypeScript, PostgreSQL (Neon), Drizzle ORM, and Redis.

## Live Deployment

The API is deployed and available at: https://e-commerce-backend-xpsc.onrender.com

Quick links:
- Swagger UI: https://e-commerce-backend-xpsc.onrender.com/api-docs
- Health check: https://e-commerce-backend-xpsc.onrender.com/health
- Base API URL: https://e-commerce-backend-xpsc.onrender.com/health

## Features

- 🔐 JWT Authentication & Authorization
- 👤 User Management (Register/Login)
- 📦 Product Management (CRUD operations)
- 🛒 Order Management with Transaction Support
- 🔍 Product Search & Pagination
- 💾 Redis Caching for Performance
- 🛡️ Rate Limiting
- 📚 Swagger API Documentation
- ✅ Comprehensive Unit Tests with Jest
- 🔒 Security Best Practices (Helmet, CORS)

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Drizzle ORM
- **Cache**: Redis
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Documentation**: Swagger
- **Testing**: Jest + Supertest
- **Security**: Helmet, express-rate-limit

## Prerequisites

- Node.js 18+ 
- PostgreSQL (Neon DB account)
- Redis (local or cloud instance)

## Installation

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
NODE_ENV=development

# Neon PostgreSQL Database URL
DATABASE_URL=postgresql://neondb_owner:npg_LQA83INJiwFa@ep-shy-dream-a4sein6g.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Configuration
JWT_SECRET=lSlGNYL9WSmGpdEpBpx6Iw/be76oQCleHgQY4opmCfc=
JWT_EXPIRES_IN=7d

# Redis Configuration (for caching)
REDIS_URL=redis://default:GL269UFLzIF2HQDUjYAlx6e3EkHZE8iF@redis-12885.c341.af-south-1-1.ec2.redns.redis-cloud.com:12885

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Setup Database:**

   **Option A - Using Drizzle Push:**
   ```bash
   # Generate migration files
   npm run db:generate
   
   # Push schema directly to database
   npm run db:push
   ```

   **Option B - Using Migrations:**
   ```bash
   # Generate migration files
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   ```

5. **Seed Database (Optional):**
   ```bash
   npm run db:seed
   ```
   This creates:
   - Admin user: `admin@ecommerce.com` / `Admin123!@#`
   - Test user: `user@ecommerce.com` / `User123!@#`
   - 10 sample products

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Run Tests
```bash
npm test
npm run test:watch
```

### Database Management
```bash
# Generate new migrations after schema changes
npm run db:generate

# Push schema changes to database (dev)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## Connection Verification

The application performs the following checks on startup:

1. ✅ **Database Connection** - Tests PostgreSQL connection
2. ✅ **Redis Connection** - Tests cache server connection
3. ✅ **Server Start** - Starts Express server

You should see:
```
🔌 Connecting to database...
✅ Database connected successfully
🔌 Connecting to Redis...
✅ Redis connected successfully

🎉 Server started successfully!
================================
🚀 Server is running on port 3000
📚 API Documentation: http://localhost:3000/api-docs
🏥 Health check: http://localhost:3000/health
================================
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Products
- `GET /products` - Get all products (with pagination & search)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (Admin only)
- `PUT /products/:id` - Update product (Admin only)
- `DELETE /products/:id` - Delete product (Admin only)

### Orders
- `POST /orders` - Place new order (Authenticated)
- `GET /orders` - Get user's order history (Authenticated)

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── db/             # Database schema and connection
├── middleware/     # Custom middleware
├── routes/         # API routes
├── services/       # Business logic & external services
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
├── __tests__/      # Unit tests
└── index.ts        # Application entry point
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based authentication
- Role-based authorization (User/Admin)
- Request validation with Zod
- Rate limiting on all endpoints
- Special rate limiting for auth endpoints
- Helmet security headers
- CORS configuration

## Database Schema

### Users Table
- id (UUID)
- username (unique)
- email (unique)
- password (hashed)
- role (user/admin)
- timestamps

### Products Table
- id (UUID)
- name
- description
- price (decimal)
- stock (integer)
- category
- userId (foreign key)
- timestamps

### Orders Table
- id (UUID)
- userId (foreign key)
- totalPrice (decimal)
- status
- description
- timestamps

### Order Items Table
- id (UUID)
- orderId (foreign key)
- productId (foreign key)
- quantity
- price
- timestamp

## Testing

The project includes comprehensive unit tests for:
- Authentication endpoints
- Product CRUD operations
- Order placement and retrieval

Run tests with coverage:
```bash
npm test
```

## Caching Strategy

- Product listings cached for 5 minutes
- Individual products cached for 5 minutes
- Cache invalidation on product creation/update/deletion
- Redis fallback to database on cache miss

## Rate Limiting

- General endpoints: 150 requests per 15 minutes
- Auth endpoints: 10 requests per 15 minutes