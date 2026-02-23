import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

export class PayPalService {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    const baseURL = config.paypal.mode === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    this.axiosInstance = axios.create({
      baseURL,
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
      const response = await this.axiosInstance.post('/v1/oauth2/token', 'grant_type=client_credentials', {
        headers: {
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
}

export const paypalService = new PayPalService();
