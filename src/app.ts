import express, { Express, Request, Response } from 'express';
import webhookRoutes from './routes/webhooks';
import ordersRoutes from './routes/orders';
import { config } from './config';

const app: Express = express();

// Middleware
app.use(express.json({ strict: false }));
app.use(express.text({ type: 'application/json' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', webhookRoutes);
app.use('/', ordersRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'PayPal Webhook API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      webhook: config.webhook.path,
      orders: {
        create: 'POST /api/orders',
        status: 'GET /api/orders/:orderId',
        confirm: 'POST /api/orders/:orderId/confirm',
        cancel: 'DELETE /api/orders/:orderId',
      },
      refunds: {
        refund: 'POST /api/payments/:captureId/refund',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} does not exist`,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'An error occurred',
  });
});

export default app;
