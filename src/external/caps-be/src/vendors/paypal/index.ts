import { PayPalService } from '../../../../../services/paypalService';

const paypalService = new PayPalService();

export async function createOrder(amount: number, currency = 'USD') {
  const result = await paypalService.createOrder({
    id: '',
    amount,
    currency,
    status: 'CREATED',
  });
  return result.data || { id: null, status: 'error', error: result.error };
}

export async function captureOrder(orderId: string) {
  const result = await paypalService.confirmOrder(orderId);
  return result.data || { id: null, status: 'error', error: result.error };
}

export async function createPaymentLink(
  amount: number,
  currency = 'USD',
  description?: string,
  referenceId?: string
) {
  const result = await paypalService.createPaymentLink({
    amount,
    currency,
    description,
    reference_id: referenceId,
  });
  return result.data || { id: null, status: 'error', error: result.error, payment_link: null };
}

export default { createOrder, captureOrder, createPaymentLink }
