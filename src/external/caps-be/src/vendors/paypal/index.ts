// Placeholder PayPal vendor integration
// Replace these functions with the real implementation from D:\caps-be\src\vendors\paypal

export async function createOrder(amount: number, currency = 'USD') {
  // TODO: paste real createOrder implementation
  return { id: 'ORDER_PLACEHOLDER', amount, currency }
}

export async function captureOrder(orderId: string) {
  // TODO: paste real captureOrder implementation
  return { id: orderId, status: 'CAPTURE_PLACEHOLDER' }
}

export default { createOrder, captureOrder }
