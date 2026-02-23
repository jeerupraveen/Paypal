import { Router, Request, Response } from 'express';
import { paypalService } from '../services/paypalService';

const router = Router();

/**
 * POST /api/orders
 * Create a new PayPal order
 */
router.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { amount, currency, description, metadata, returnUrl } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'amount and currency are required',
      });
    }

    const result = await paypalService.createOrder({
      id: '', // Will be assigned by PayPal
      amount,
      currency,
      status: 'CREATED',
      description,
      metadata,
      returnUrl,
    });

    if (result.success && result.data) {
      return res.status(201).json({
        success: true,
        data: {
          orderId: result.data.id,
          status: result.data.status,
          links: result.data.links,
        },
      });
    }

    return res.status(400).json({
      success: false,
      error: result.error,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
});

/**
 * POST /api/orders/:orderId/confirm
 * Confirm/Capture a PayPal order
 */
router.post('/api/orders/:orderId/confirm', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId is required',
      });
    }

    const result = await paypalService.confirmOrder(orderId);

    if (result.success && result.data) {
      return res.status(200).json({
        success: true,
        data: {
          orderId: result.data.id,
          status: result.data.status,
          payer: result.data.payer,
          captureId: result.data.purchase_units?.[0]?.payments?.captures[0]?.id,
        },
      });
    }

    return res.status(400).json({
      success: false,
      error: result.error,
    });
  } catch (error) {
    console.error('Error confirming order:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to confirm order',
    });
  }
});

/**
 * GET /api/orders/:orderId
 * Get order status
 */
router.get('/api/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId is required',
      });
    }

    const result = await paypalService.getOrderStatus(orderId);

    if (result.success && result.data) {
      return res.status(200).json({
        success: true,
        data: {
          orderId: result.data.id,
          status: result.data.status,
          payer: result.data.payer,
          amount: result.data.purchase_units?.[0]?.amount,
          captureId: result.data.purchase_units?.[0]?.payments?.captures[0]?.id,
        },
      });
    }

    return res.status(404).json({
      success: false,
      error: result.error,
    });
  } catch (error) {
    console.error('Error getting order status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get order status',
    });
  }
});

/**
 * DELETE /api/orders/:orderId
 * Cancel an order
 */
router.delete('/api/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId is required',
      });
    }

    const result = await paypalService.cancelOrder(orderId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    }

    return res.status(400).json({
      success: false,
      error: result.error,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel order',
    });
  }
});

/**
 * POST /api/payments/:captureId/refund
 * Refund a payment
 */
router.post('/api/payments/:captureId/refund', async (req: Request, res: Response) => {
  try {
    const { captureId } = req.params;
    const { amount, currency, description, metadata } = req.body;

    if (!captureId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'captureId, amount, and currency are required',
      });
    }

    const result = await paypalService.refundPayment(captureId, {
      amount,
      currency,
      description,
      metadata,
    });

    if (result.success && result.data) {
      return res.status(201).json({
        success: true,
        data: {
          refundId: result.data.id,
          status: result.data.status,
          links: result.data.links,
        },
      });
    }

    return res.status(400).json({
      success: false,
      error: result.error,
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to refund payment',
    });
  }
});

export default router;
