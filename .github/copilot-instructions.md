# PayPal Webhook Backend - Copilot Instructions

## Project Overview

This is a Node.js TypeScript backend server that handles PayPal webhook events. It provides secure webhook processing, event validation, and business logic handlers for PayPal transactions.

## Project Structure

- **src/config/** - Environment configuration and settings
- **src/routes/** - Express.js route definitions
- **src/services/** - PayPal API integration service
- **src/webhooks/** - Webhook event handlers for PayPal events
- **src/types/** - TypeScript type definitions
- **dist/** - Compiled JavaScript output (generated)

## Key Technologies

- Node.js with TypeScript
- Express.js for HTTP server
- Axios for HTTP requests
- PayPal API integration

## Getting Started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add PayPal credentials
3. Start in development: `npm run dev`
4. Build for production: `npm run build && npm start`

## Development Guidelines

- **Language**: TypeScript with strict mode enabled
- **Code Style**: ES2020 target with modern JavaScript features
- **Testing**: Add test framework and tests as needed
- **Logging**: Use console methods; upgrade to Winston/Bunyan for production
- **Error Handling**: All errors should be caught and logged appropriately

## Webhook Event Handlers

When adding new event types:

1. Add handler method in `src/webhooks/paypalWebhookHandler.ts`
2. Add case to `processEvent()` switch statement
3. Document in README.md

## Environment Variables

Required:
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`

Optional:
- `PORT` (default: 3000)
- `NODE_ENV` (default: development)
- `PAYPAL_MODE` (default: sandbox)
- `WEBHOOK_PATH` (default: /api/webhooks/paypal)

## Common Tasks

### Add Database Integration
- Create new service in `src/services/`
- Use in webhook handlers to persist data

### Add Authentication
- Create middleware in `src/routes/`
- Protect endpoints that aren't PayPal webhooks

### Deploy to Production
- Set `NODE_ENV=production`
- Switch to live PayPal credentials
- Enable HTTPS
- Use process manager (PM2, systemd, etc.)

## Build and Run

- `npm run dev` - Development server with auto-reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled server
- `npm run watch` - Watch mode

## Notes for Future Development

- Consider adding OpenAPI/Swagger documentation
- Add comprehensive error handling and recovery
- Implement database persistence layer
- Add request validation and sanitization
- Set up CI/CD pipeline for automated testing
