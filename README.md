# PayPal Webhook Backend API

A Node.js backend server built with TypeScript that handles PayPal webhook events. This server receives and processes webhook notifications from PayPal for orders, payments, subscriptions, and other business events.

## Features

- 🔐 **Webhook Signature Verification** - Secure verification of PayPal webhook signatures
- 📦 **Order Management** - Handle order completion, approval, and payment events
- 💳 **Payment Processing** - Process payment captures, denials, and refunds
- 📅 **Subscription Handling** - Manage subscription creation, updates, and cancellations
- 🏥 **Health Checks** - Built-in health check endpoint
- 📝 **TypeScript Support** - Full type safety and modern JavaScript features
- ⚡ **Express.js** - Fast and minimalist web framework
- 🔄 **Complete Order Lifecycle** - Create, confirm, cancel, and refund orders through REST API
- 🎯 **Payment Processing API** - Full Checkout API integration with PayPal
- 💾 **Token Caching** - Automatic OAuth2 token management with expiration handling

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **PayPal Developer Account** with sandbox/live credentials
- **PayPal API Credentials** (Client ID and Secret)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your PayPal credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your PayPal credentials:

```env
PORT=3000
NODE_ENV=development

# Get these from PayPal Developer Dashboard
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=<your-client-id>
PAYPAL_CLIENT_SECRET=<your-client-secret>
PAYPAL_WEBHOOK_ID=<your-webhook-id>

WEBHOOK_PATH=/api/webhooks/paypal
```

### 3. Get PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com)
2. Create or select your app
3. Copy your **Client ID** and **Client Secret**
4. Set up a webhook in the Developer Dashboard and note the **Webhook ID**

### 4. Build and Run

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

#### Watch Mode (for development)

```bash
npm run watch
```

## API Endpoints

### Health Check

```http
GET /api/health
```

Returns server status and health information.

**Response:**
```json
{
  "status": "online",
  "timestamp": "2024-02-23T10:30:00.000Z",
  "environment": "development"
}
```

### Root Endpoint

```http
GET /
```

Returns API information and available endpoints.

**Response:**
```json
{
  "name": "PayPal Webhook API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/api/health",
    "webhook": "/api/webhooks/paypal",
    "orders": {
      "create": "POST /api/orders",
      "status": "GET /api/orders/:orderId",
      "confirm": "POST /api/orders/:orderId/confirm",
      "cancel": "DELETE /api/orders/:orderId"
    },
    "refunds": {
      "refund": "POST /api/payments/:captureId/refund"
    }
  }
}
```

### Orders

#### Create Order

```http
POST /api/orders
```

Create a new PayPal order.

**Request Body:**
```json
{
  "amount": 10000,
  "currency": "USD",
  "description": "Product description",
  "metadata": {
    "order_id": "12345",
    "customer_id": "cust_123"
  },
  "returnUrl": "https://example.com/return"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "orderId": "5O190127070081303",
    "status": "CREATED",
    "links": [
      {
        "rel": "approve",
        "href": "https://www.sandbox.paypal.com/checkoutnow?..."
      }
    ]
  }
}
```

#### Get Order Status

```http
GET /api/orders/:orderId
```

Check the status of a PayPal order.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderId": "5O190127070081303",
    "status": "APPROVED",
    "payer": {
      "email_address": "customer@example.com"
    },
    "amount": {
      "currency_code": "USD",
      "value": "100.00"
    },
    "captureId": "3C679366..."
  }
}
```

#### Confirm/Capture Order

```http
POST /api/orders/:orderId/confirm
```

Confirm and capture a PayPal order (complete the payment).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderId": "5O190127070081303",
    "status": "COMPLETED",
    "payer": {
      "email_address": "customer@example.com",
      "name": {
        "given_name": "John",
        "surname": "Doe"
      }
    },
    "captureId": "3C679366..."
  }
}
```

#### Cancel Order

```http
DELETE /api/orders/:orderId
```

Cancel an order.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

### Payments

#### Refund Payment

```http
POST /api/payments/:captureId/refund
```

Refund a completed payment.

**Request Body:**
```json
{
  "amount": 10000,
  "currency": "USD",
  "description": "Customer requested refund",
  "metadata": {
    "reason": "quality_issue"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "refundId": "9HH86..."
    "status": "PENDING",
    "links": [
      {
        "rel": "self",
        "href": "https://api.sandbox.paypal.com/v2/payments/refunds/9HH86..."
      }
    ]
  }
}
```

### PayPal Webhook

```http
POST /api/webhooks/paypal
```

Receives webhook events from PayPal.

**Headers Required:**
```
paypal-transmission-id: <transmission-id>
paypal-transmission-time: <ISO-8601-timestamp>
paypal-cert-url: <certificate-url>
paypal-auth-algo: <algorithm>
paypal-transmission-sig: <signature>
```

**Request Body:**
```json
{
  "id": "WH-XXXXX",
  "event_type": "CHECKOUT.ORDER.COMPLETED",
  "create_time": "2024-02-23T10:30:00Z",
  "resource": {
    "id": "ORDER-ID",
    "status": "COMPLETED"
  }
}
```

## Supported Webhook Events

The server handles the following PayPal webhook events:

### Order Events
- `CHECKOUT.ORDER.COMPLETED` - Order completed
- `CHECKOUT.ORDER.APPROVED` - Order approved

### Payment Events
- `PAYMENT.CAPTURE.COMPLETED` - Payment successfully captured
- `PAYMENT.CAPTURE.DENIED` - Payment capture denied
- `PAYMENT.CAPTURE.REFUNDED` - Payment refunded

### Subscription Events
- `BILLING.SUBSCRIPTION.CREATED` - Subscription created
- `BILLING.SUBSCRIPTION.UPDATED` - Subscription updated
- `BILLING.SUBSCRIPTION.CANCELLED` - Subscription cancelled

## Project Structure

```
src/
├── config/           # Configuration files
│   └── index.ts      # Environment config
├── routes/           # Express routes
│   ├── webhooks.ts   # Webhook routes
│   └── orders.ts     # Order management routes
├── services/         # Business logic
│   └── paypalService.ts  # PayPal API service with full order lifecycle
├── webhooks/         # Webhook handlers
│   └── paypalWebhookHandler.ts   # Event handlers
├── types/            # TypeScript type definitions
│   └── paypal.ts     # PayPal API types
├── app.ts            # Express app setup
└── index.ts          # Server entry point

dist/                # Compiled JavaScript output
```

## Key Components

### PayPalService (`src/services/paypalService.ts`)

Handles all PayPal API interactions:
- **getAccessToken()** - Obtains OAuth2 access token with caching
- **verifyWebhookSignature()** - Verifies webhook authenticity
- **getWebhookEvent()** - Retrieves webhook event details
- **createOrder()** - Creates a new PayPal order
- **confirmOrder()** - Captures and completes a PayPal order
- **getOrderStatus()** - Retrieves current order status
- **cancelOrder()** - Cancels an order locally
- **refundPayment()** - Initiates a refund for a payment

### WebhookHandler (`src/webhooks/paypalWebhookHandler.ts`)

Processes incoming webhook events:
- Event validation and signature verification
- Event routing based on event type
- Specific handlers for different event types
- Support for 8+ PayPal webhook event types

### Order Routes (`src/routes/orders.ts`)

REST API endpoints for PayPal operations:
- Create orders
- Get order status
- Confirm/capture orders
- Cancel orders
- Refund payments

## Development

### Running Tests

```bash
npm test
```

(Currently no tests configured - add your test framework)

### Building

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Debugging

The project includes source maps for easier debugging:

1. Set breakpoints in TypeScript files
2. Use a debugger with source map support
3. Run in development mode: `npm run dev`

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment (development/production) |
| `PAYPAL_MODE` | No | `sandbox` | PayPal mode (sandbox/live) |
| `PAYPAL_CLIENT_ID` | Yes | - | PayPal API Client ID |
| `PAYPAL_CLIENT_SECRET` | Yes | - | PayPal API Client Secret |
| `PAYPAL_WEBHOOK_ID` | Yes | - | PayPal Webhook ID |
| `WEBHOOK_PATH` | No | `/api/webhooks/paypal` | Webhook endpoint path |

## Security Considerations

1. **Signature Verification** - All webhooks are verified using PayPal's signature verification
2. **HTTPS** - Use HTTPS in production
3. **Environment Variables** - Never commit `.env` to version control
4. **Token Caching** - OAuth tokens are cached with automatic refresh
5. **Error Handling** - Sensitive errors are not exposed in responses

## Usage Examples

### Create a PayPal Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "currency": "USD",
    "description": "Order for product X"
  }'
```

### Confirm/Capture an Order

```bash
curl -X POST http://localhost:3000/api/orders/{orderId}/confirm \
  -H "Content-Type: application/json"
```

### Check Order Status

```bash
curl http://localhost:3000/api/orders/{orderId}
```

### Refund a Payment

```bash
curl -X POST http://localhost:3000/api/payments/{captureId}/refund \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "USD",
    "description": "Refund for order cancellation"
  }'
```

### Cancel an Order

```bash
curl -X DELETE http://localhost:3000/api/orders/{orderId}
```

## Extending the Application

### Adding Custom Event Handlers

Edit `src/webhooks/paypalWebhookHandler.ts` and add methods:

```typescript
private async handleCustomEvent(event: PayPalWebhookEvent): Promise<void> {
  // Handle event
}
```

Then add to the `processEvent()` switch statement.

### Adding Database Integration

1. Install your database driver (e.g., `npm install mongodb`)
2. Create a service in `src/services/`
3. Import and use in webhook handlers

### Adding Authentication

1. Add JWT or API key middleware
2. Secure endpoints that don't require PayPal verification
3. Use in route guards

## Troubleshooting

### Issue: Webhook signature verification fails
- **Solution**: Ensure PAYPAL_WEBHOOK_ID matches the webhook ID in PayPal dashboard
- Check that webhook headers are correctly forwarded
- Verify webhook is properly registered in PayPal Developer Dashboard

### Issue: Access token errors
- **Solution**: Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are correct
- Check PayPal API credentials in Developer Dashboard
- Ensure credentials match the correct PayPal mode (sandbox/live)

### Issue: Module not found errors
- **Solution**: Run `npm install` to install dependencies
- Delete `node_modules/` and `package-lock.json`, then reinstall
- Clear TypeScript build cache: `rm -rf dist/`

## Production Deployment

### Before deploying to production:

1. Set `NODE_ENV=production`
2. Use live PayPal credentials instead of sandbox
3. Enable HTTPS/TLS
4. Set up proper logging and monitoring
5. Implement database persistence
6. Add process manager (PM2, systemd, etc.)
7. Configure environment variables securely
8. Set up proper error handling and alerts

### Example PM2 Configuration

```bash
npm install -g pm2
pm2 start dist/index.js --name "paypal-webhook"
pm2 save
pm2 startup
```

## Debug Logs

Server logs include timestamps and request information. Example:

```
[2024-02-23T10:30:00.000Z] POST /api/webhooks/paypal
Processing event: CHECKOUT.ORDER.COMPLETED
Order completed: {
  orderId: "5O190127070081303",
  status: "COMPLETED",
  amount: "99.99"
}
```

## Support and Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [Webhook Events](https://developer.paypal.com/docs/api-basics/webhooks/webhook-events/)
- [Signature Verification](https://developer.paypal.com/docs/api-basics/webhooks/verify-webhook/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

## License

ISC

## Author

Your Name

---

**Last Updated**: February 23, 2024
