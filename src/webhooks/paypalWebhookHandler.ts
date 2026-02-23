import { config } from '../config';
import { paypalService } from '../services/paypalService';

export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  create_time: string;
  resource: any;
  [key: string]: any;
}

export class WebhookHandler {
  /**
   * Handle incoming PayPal webhook
   */
  async handle(
    eventBody: string,
    headers: Record<string, string>
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify webhook signature
      const isValid = await paypalService.verifyWebhookSignature(
        config.paypal.webhookId,
        eventBody,
        headers
      );

      if (!isValid) {
        console.warn('Invalid webhook signature received');
        return {
          success: false,
          message: 'Invalid webhook signature',
        };
      }

      // Parse the event
      const event: PayPalWebhookEvent = JSON.parse(eventBody);

      // Route to appropriate handler based on event type
      await this.processEvent(event);

      return {
        success: true,
        message: `Event ${event.event_type} processed successfully`,
      };
    } catch (error) {
      console.error('Error processing webhook:', error);
      return {
        success: false,
        message: 'Error processing webhook',
      };
    }
  }

  /**
   * Process webhook event based on type
   */
  private async processEvent(event: PayPalWebhookEvent): Promise<void> {
    console.log(`Processing event: ${event.event_type}`);

    switch (event.event_type) {
      case 'CHECKOUT.ORDER.COMPLETED':
        await this.handleOrderCompleted(event);
        break;
      case 'CHECKOUT.ORDER.APPROVED':
        await this.handleOrderApproved(event);
        break;
      case 'PAYMENT.CAPTURE.COMPLETED':
        await this.handlePaymentCompleted(event);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await this.handlePaymentDenied(event);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await this.handlePaymentRefunded(event);
        break;
      case 'BILLING.SUBSCRIPTION.CREATED':
        await this.handleSubscriptionCreated(event);
        break;
      case 'BILLING.SUBSCRIPTION.UPDATED':
        await this.handleSubscriptionUpdated(event);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await this.handleSubscriptionCancelled(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }
  }

  /**
   * Handle order completed event
   */
  private async handleOrderCompleted(event: PayPalWebhookEvent): Promise<void> {
    const { resource } = event;
    console.log('Order completed:', {
      orderId: resource.id,
      status: resource.status,
      amount: resource.purchase_units?.[0]?.amount?.value,
    });

    // TODO: Update database with order information
    // TODO: Trigger order fulfillment process
    // TODO: Send confirmation email
  }

  /**
   * Handle order approved event
   */
  private async handleOrderApproved(event: PayPalWebhookEvent): Promise<void> {
    const { resource } = event;
    console.log('Order approved:', {
      orderId: resource.id,
      status: resource.status,
    });

    // TODO: Store pending order in database
  }

  /**
   * Handle payment capture completed event
   */
  private async handlePaymentCompleted(event: PayPalWebhookEvent): Promise<void> {
    const { resource } = event;
    console.log('Payment captured:', {
      captureId: resource.id,
      status: resource.status,
      amount: resource.amount?.value,
    });

    // TODO: Mark payment as completed in database
  }

  /**
   * Handle payment capture denied event
   */
  private async handlePaymentDenied(event: PayPalWebhookEvent): Promise<void> {
    const { resource } = event;
    console.log('Payment denied:', {
      captureId: resource.id,
      status: resource.status,
    });

    // TODO: Handle denied payment
  }

  /**
   * Handle payment refunded event
   */
  private async handlePaymentRefunded(event: PayPalWebhookEvent): Promise<void> {
    const { resource } = event;
    console.log('Payment refunded:', {
      refundId: resource.id,
      status: resource.status,
      amount: resource.amount?.value,
    });

    // TODO: Update order refund status in database
  }

  /**
   * Handle subscription created event
   */
  private async handleSubscriptionCreated(event: PayPalWebhookEvent): Promise<void> {
    const { resource } = event;
    console.log('Subscription created:', {
      subscriptionId: resource.id,
      status: resource.status,
      planId: resource.plan_id,
    });

    // TODO: Store subscription in database
  }

  /**
   * Handle subscription updated event
   */
  private async handleSubscriptionUpdated(event: PayPalWebhookEvent): Promise<void> {
    const { resource } = event;
    console.log('Subscription updated:', {
      subscriptionId: resource.id,
      status: resource.status,
    });

    // TODO: Update subscription in database
  }

  /**
   * Handle subscription cancelled event
   */
  private async handleSubscriptionCancelled(event: PayPalWebhookEvent): Promise<void> {
    const { resource } = event;
    console.log('Subscription cancelled:', {
      subscriptionId: resource.id,
      status: resource.status,
    });

    // TODO: Update subscription status in database
  }
}

export const webhookHandler = new WebhookHandler();
