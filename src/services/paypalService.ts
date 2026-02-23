import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import {
  PayPalOrderRequest,
  PayPalOrderResponse,
  PayPalConfirmResponse,
  PayPalStatusResponse,
  PayPalRefundResponse,
  OrderData,
  RefundData,
} from '../types/paypal';

export class PayPalService {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private baseURL: string;

  constructor() {
    this.baseURL = config.paypal.mode === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      auth: {
        username: config.paypal.clientId,
        password: config.paypal.clientSecret,
      },
    });
  }

  /**
   * Get OAuth2 access token from PayPal
   */
  async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const authToken = Buffer.from(
        `${config.paypal.clientId}:${config.paypal.clientSecret}`
      ).toString('base64');

      const response = await axios.post(`${this.baseURL}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: {
          Authorization: `Basic ${authToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access_token;
      // Set expiry 5 minutes before actual expiration
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - (5 * 60 * 1000);

      return this.accessToken || '';
    } catch (error) {
      console.error('Failed to get PayPal access token:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature from PayPal
   */
  async verifyWebhookSignature(
    webhookId: string,
    eventBody: string,
    headers: Record<string, string>
  ): Promise<boolean> {
    try {
      const token = await this.getAccessToken();

      const verificationData = {
        transmission_id: headers['paypal-transmission-id'],
        transmission_time: headers['paypal-transmission-time'],
        cert_url: headers['paypal-cert-url'],
        auth_algo: headers['paypal-auth-algo'],
        transmission_sig: headers['paypal-transmission-sig'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(eventBody),
      };

      const response = await this.axiosInstance.post(
        '/v1/notifications/verify-webhook-signature',
        verificationData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('Failed to verify webhook signature:', error);
      return false;
    }
  }

  /**
   * Get webhook event details
   */
  async getWebhookEvent(eventId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await this.axiosInstance.get(`/v1/notifications/webhooks-events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get webhook event:', error);
      throw error;
    }
  }

  /**
   * Create a PayPal order
   */
  async createOrder(orderData: OrderData): Promise<{
    success: boolean;
    data?: PayPalOrderResponse;
    error?: string;
  }> {
    try {
      const token = await this.getAccessToken();

      const payloadData: PayPalOrderRequest = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: orderData.currency.toUpperCase(),
              value: (orderData.amount / 100).toString(), // Convert to human-readable format
            },
          },
        ],
        application_context: {
          locale: 'en-US',
        },
      };

      const response = await axios.post<PayPalOrderResponse>(
        `${this.baseURL}/v2/checkout/orders`,
        payloadData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 && response.data.id) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: 'Failed to create PayPal order',
      };
    } catch (error: any) {
      console.error('Error creating PayPal order:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to create PayPal order',
      };
    }
  }

  /**
   * Confirm/Capture a PayPal order
   */
  async confirmOrder(orderId: string): Promise<{
    success: boolean;
    data?: PayPalConfirmResponse;
    error?: string;
  }> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post<PayPalConfirmResponse>(
        `${this.baseURL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if ([200, 201].includes(response.status) && response.data.id) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: 'Failed to confirm PayPal order',
      };
    } catch (error: any) {
      console.error('Error confirming PayPal order:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to confirm PayPal order',
      };
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<{
    success: boolean;
    data?: PayPalStatusResponse;
    error?: string;
  }> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get<PayPalStatusResponse>(
        `${this.baseURL}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.id) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: 'Failed to get order status',
      };
    } catch (error: any) {
      console.error('Error getting order status:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to get order status',
      };
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Note: PayPal doesn't have a direct cancel endpoint for orders
      // Cancellation is handled through order status checks and payment denial
      // This is a placeholder for local cancellation tracking

      console.log(`Order ${orderId} marked as cancelled locally`);

      return {
        success: true,
        message: 'Order cancelled successfully',
      };
    } catch (error: any) {
      console.error('Error cancelling order:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to cancel order',
      };
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(captureId: string, refundData: RefundData): Promise<{
    success: boolean;
    data?: PayPalRefundResponse;
    error?: string;
  }> {
    try {
      const token = await this.getAccessToken();

      const refundPayload = {
        amount: {
          currency_code: refundData.currency.toUpperCase(),
          value: (refundData.amount / 100).toString(), // Convert to human-readable format
        },
        note_to_payer: refundData.description || 'Refund requested',
      };

      const response = await axios.post<PayPalRefundResponse>(
        `${this.baseURL}/v2/payments/captures/${captureId}/refund`,
        refundPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if ([200, 201].includes(response.status) && response.data.id) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: 'Failed to refund payment',
      };
    } catch (error: any) {
      console.error('Error refunding payment:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to refund payment',
      };
    }
  }
}

export const paypalService = new PayPalService();
