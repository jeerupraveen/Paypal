import { Router, Request, Response } from 'express';
import { webhookHandler } from '../webhooks/paypalWebhookHandler';
import { config } from '../config';

const router = Router();

/**
 * POST /api/webhooks/paypal
 * Receive PayPal webhook events
 */
router.post(config.webhook.path, async (req: Request, res: Response) => {
  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const headers = req.headers as Record<string, string>;

    const result = await webhookHandler.handle(body, headers);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Webhook endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

export default router;
