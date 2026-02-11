# Order Service

A microservice for order management in the Shopverse e-commerce platform. Built with NestJS, featuring both HTTP REST API and Redis microservice capabilities.

## Overview

The Order Service handles:
- Order creation and management
- Order status tracking
- Customer order history
- Order cancellation

## Port

- **Default**: 7001
- **Configurable via**: `PORT` environment variable

## Prerequisites

- Node.js >= 18.x
- MongoDB (local or Atlas)
- Redis server running

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root of this service:

```env
PORT=7001
REDIS_URL=redis://localhost:6379
MONGO_DB=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/shoppers
```

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | HTTP server port | 7001 |
| REDIS_URL | Redis connection URL | redis://localhost:6379 |
| MONGO_DB | MongoDB connection string | - |

## Running the Service

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Service health check |

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /order | Get all orders |
| GET | /order?customerId=:id | Get orders by customer |
| GET | /order/:orderId | Get order by ID |
| POST | /order | Create new order |
| PUT | /order/:orderId | Update order |
| PUT | /order/:orderId/status | Update order status |
| PUT | /order/:orderId/cancel | Cancel order |
| DELETE | /order/:orderId | Delete order |

## Swagger Documentation

Access Swagger UI at: `http://localhost:7001/api`

## Data Models

### Order Schema

```typescript
{
  orderId: string,           // Auto-generated, Unique
  customerId: number,        // Required
  items: OrderItem[],        // Required
  totalAmount: number,       // Auto-calculated
  status: OrderStatus,       // Default: 'pending'
  shippingAddress: {
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country?: string
  },
  notes?: string,
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### OrderItem Schema

```typescript
{
  sku: string,               // Product SKU
  name: string,              // Product name
  quantity: number,          // Min: 1
  price: number              // Min: 0
}
```

### Order Status Enum

```typescript
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}
```

## Request/Response Examples

### Create Order

**Request:**
```bash
curl -X POST http://localhost:7001/order \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {
        "sku": "LAPTOP-001",
        "name": "MacBook Pro 14",
        "quantity": 1,
        "price": 199900
      },
      {
        "sku": "MOUSE-001",
        "name": "Magic Mouse",
        "quantity": 2,
        "price": 7900
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "India"
    },
    "notes": "Please deliver before 5 PM"
  }'
```

**Response:**
```json
{
  "_id": "...",
  "orderId": "ORD-1705312200000-abc123def",
  "customerId": 1,
  "items": [...],
  "totalAmount": 215700,
  "status": "pending",
  "shippingAddress": {...},
  "notes": "Please deliver before 5 PM",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Get All Orders

```bash
curl http://localhost:7001/order
```

### Get Customer Orders

```bash
curl http://localhost:7001/order?customerId=1
```

### Get Order by ID

```bash
curl http://localhost:7001/order/ORD-1705312200000-abc123def
```

### Update Order Status

```bash
curl -X PUT http://localhost:7001/order/ORD-1705312200000-abc123def/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

### Cancel Order

```bash
curl -X PUT http://localhost:7001/order/ORD-1705312200000-abc123def/cancel
```

Note: Orders with status 'shipped' or 'delivered' cannot be cancelled.

### Delete Order

```bash
curl -X DELETE http://localhost:7001/order/ORD-1705312200000-abc123def
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ORDER SERVICE                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │           NestJS Application                     │    │
│  │      (HTTP Server + Redis Microservice)          │    │
│  └────────────────────┬────────────────────────────┘    │
│                       │                                  │
│  ┌────────────────────▼────────────────────────────┐    │
│  │            Order Controller                      │    │
│  │      (REST endpoints + Message handlers)         │    │
│  └────────────────────┬────────────────────────────┘    │
│                       │                                  │
│  ┌────────────────────▼────────────────────────────┐    │
│  │             Order Service                        │    │
│  │           (Business logic)                       │    │
│  └────────────────────┬────────────────────────────┘    │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
    ┌─────────────┐           ┌─────────────┐
    │   MongoDB   │           │    Redis    │
    │  (Orders)   │           │ (Transport) │
    └─────────────┘           └─────────────┘
```

## Project Structure

```
order-service/
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root module
│   ├── app.controller.ts      # App controller
│   ├── app.service.ts         # App service
│   └── order/
│       ├── order.module.ts    # Order module
│       ├── order.controller.ts # REST endpoints
│       ├── order.service.ts   # Business logic
│       ├── dto/
│       │   ├── create-order.dto.ts
│       │   └── update-order.dto.ts
│       └── schemas/
│           └── order.schema.ts # Mongoose schema
├── .env                       # Environment variables
└── package.json
```

## Dependencies

| Package | Purpose |
|---------|---------|
| @nestjs/core | NestJS framework |
| @nestjs/microservices | Redis transport |
| @nestjs/mongoose | MongoDB integration |
| @nestjs/config | Environment configuration |
| @nestjs/swagger | API documentation |
| class-validator | DTO validation |
| class-transformer | Object transformation |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start in production mode |
| `npm run start:dev` | Start in development mode with hot reload |
| `npm run start:debug` | Start in debug mode |
| `npm run start:prod` | Start compiled production build |
| `npm run build` | Build the application |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |

## Order Flow

```
┌─────────┐    ┌───────────┐    ┌────────────┐    ┌─────────┐    ┌───────────┐
│ PENDING │ -> │ CONFIRMED │ -> │ PROCESSING │ -> │ SHIPPED │ -> │ DELIVERED │
└─────────┘    └───────────┘    └────────────┘    └─────────┘    └───────────┘
     │
     └──────────────────────────────────────────────────────────> ┌───────────┐
                                                                  │ CANCELLED │
                                                                  └───────────┘
```

## Troubleshooting

### MongoDB Connection Error
- Verify connection string format
- Check MongoDB Atlas network access settings
- Ensure IP whitelist includes your IP

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping`
- Check REDIS_URL format

### Order Creation Fails
- Verify all required fields are provided
- Check that items array is not empty
- Validate shipping address format
