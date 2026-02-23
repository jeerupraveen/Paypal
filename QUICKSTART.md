# Quick Start Guide

## Setup Instructions

### 1. Configure Your PayPal Credentials

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your PayPal credentials from [PayPal Developer Dashboard](https://developer.paypal.com):

```env
PORT=3000
NODE_ENV=development
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=<your-client-id-here>
PAYPAL_CLIENT_SECRET=<your-client-secret-here>
PAYPAL_WEBHOOK_ID=<your-webhook-id-here>
WEBHOOK_PATH=/api/webhooks/paypal
```

### 2. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

### 3. Test the Server

Open your browser or use curl:

```bash
curl http://localhost:3000
```

Expected response:
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

### 4. Register Webhook in PayPal Dashboard

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Navigate to Apps & Credentials
3. Select your app
4. Go to **Webhook setup** in the left menu
5. Add your webhook URL: `https://yourdomain.com/api/webhooks/paypal`
6. Select the events you want to listen to
7. Copy the **Webhook ID** to your `.env` file

## Project Structure

```
paypal-webhook-backend/
├── src/
│   ├── config/              # Configuration management
│   ├── routes/              # API routes
│   ├── services/            # PayPal API service
│   ├── webhooks/            # Webhook event handlers
│   ├── types/               # TypeScript type definitions
│   ├── app.ts               # Express application setup
│   └── index.ts             # Server entry point
├── dist/                    # Compiled JavaScript (generated)
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # Full documentation
```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run watch` - Watch mode for development

## Webhook Events Supported

- ✅ Order events (CHECKOUT.ORDER.COMPLETED, CHECKOUT.ORDER.APPROVED)
- ✅ Payment events (PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED)
- ✅ Subscription events (BILLING.SUBSCRIPTION.CREATED, BILLING.SUBSCRIPTION.UPDATED, BILLING.SUBSCRIPTION.CANCELLED)

## Next Steps

1. **Add Database**: Integrate MongoDB, PostgreSQL, or your preferred database
2. **Add Authentication**: Secure non-webhook endpoints with JWT or API keys
3. **Implement Order Processing**: Add your business logic in the webhook handlers
4. **Set Up Logging**: Add a proper logging solution (Winston, Bunyan, etc.)
5. **Deploy**: Deploy to your hosting provider (Heroku, AWS, DigitalOcean, etc.)

## Troubleshooting

### Issue: Dependencies not installed
```bash
npm install
```

### Issue: TypeScript errors
```bash
npm run build
```

### Issue: Port already in use
Change `PORT` in `.env` file

### Issue: Webhook signature verification fails
- Verify `PAYPAL_WEBHOOK_ID` matches your webhook ID in PayPal Dashboard
- Ensure webhook is properly registered in PayPal Developer Dashboard
- Check that you're using the correct mode (sandbox vs live)

## Security Tips

- 🔒 Never commit `.env` file to version control
- 🔑 Use environment variables for all secrets
- 🔐 Always verify webhook signatures
- ⚡ Implement rate limiting in production
- 🛡️ Use HTTPS in production
- 📝 Enable proper logging and monitoring

---

For detailed documentation, see [README.md](./README.md)
