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
    "webhook": "/api/webhooks/paypal"
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
│   └── webhooks.ts   # Webhook routes
├── services/         # Business logic
│   └── paypalService.ts  # PayPal API service
├── webhooks/         # Webhook handlers
│   └── paypalWebhookHandler.ts   # Event handlers
├── types/            # TypeScript type definitions
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

### WebhookHandler (`src/webhooks/paypalWebhookHandler.ts`)

Processes incoming webhook events:
- Event validation and signature verification
- Event routing based on event type
- Specific handlers for different event types

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
