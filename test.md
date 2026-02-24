# PayPal API Test Commands

## Base URL
```
http://localhost:3000
```

## Environment Variables
Set before running tests:
```bash
export BASE_URL=http://localhost:3000
export AMOUNT=9999  # in cents ($99.99)
export CURRENCY=USD
```

---

## 1. Create Payment Link

```bash
curl -X POST $BASE_URL/api/payment-links \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 9999,
    "currency": "USD",
    "description": "Premium Subscription",
    "reference_id": "SUB-12345"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "linkId": "invoice_id_here",
    "status": "CREATED",
    "payment_link": "https://sandbox.paypal.com/invoice/invoice_id_here",
    "links": [
      {
        "rel": "invoice_url",
        "href": "https://sandbox.paypal.com/invoice/invoice_id_here"
      }
    ]
  }
}
```

---

## 2. Create Order

```bash
curl -X POST $BASE_URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "USD",
    "description": "Test Order",
    "metadata": {
      "customer_id": "CUST-001"
    },
    "returnUrl": "https://example.com/return"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_id_here",
    "status": "CREATED",
    "links": [
      {
        "rel": "approve",
        "href": "https://sandbox.paypal.com/checkoutnow?token=order_id_here"
      }
    ]
  }
}
```

Save the `orderId` for next steps:
```bash
export ORDER_ID=order_id_here
```

---

## 3. Get Order Status

```bash
curl -X GET $BASE_URL/api/orders/$ORDER_ID \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_id_here",
    "status": "APPROVED",
    "payer": {
      "email_address": "buyer@example.com",
      "name": {
        "given_name": "John",
        "surname": "Doe"
      }
    },
    "amount": {
      "currency_code": "USD",
      "value": "50.00"
    },
    "captureId": "capture_id_here"
  }
}
```

---

## 4. Capture/Confirm Order

```bash
curl -X POST $BASE_URL/api/orders/$ORDER_ID/confirm \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_id_here",
    "status": "COMPLETED",
    "payer": {
      "email_address": "buyer@example.com",
      "name": {
        "given_name": "John",
        "surname": "Doe"
      }
    },
    "captureId": "capture_id_here"
  }
}
```

Save the `captureId` for refunds:
```bash
export CAPTURE_ID=capture_id_here
```

---

## 5. Refund Payment

```bash
curl -X POST $BASE_URL/api/payments/$CAPTURE_ID/refund \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "USD",
    "description": "Refund for order",
    "metadata": {
      "reason": "customer_request"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "refund_id_here",
    "status": "COMPLETED",
    "links": [
      {
        "rel": "up",
        "href": "https://api.sandbox.paypal.com/v2/payments/captures/capture_id_here"
      }
    ]
  }
}
```

---

## 6. Cancel Order

```bash
curl -X DELETE $BASE_URL/api/orders/$ORDER_ID \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

## Complete Test Flow

Run this script to test the entire flow:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=== Step 1: Create Payment Link ==="
LINK_RESPONSE=$(curl -s -X POST $BASE_URL/api/payment-links \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 9999,
    "currency": "USD",
    "description": "Test Payment Link",
    "reference_id": "REF-'$(date +%s)'"
  }')
echo $LINK_RESPONSE | jq .
PAYMENT_LINK=$(echo $LINK_RESPONSE | jq -r '.data.payment_link')
echo "Payment Link: $PAYMENT_LINK"

echo -e "\n=== Step 2: Create Order ==="
ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "USD",
    "description": "Test Order"
  }')
echo $ORDER_RESPONSE | jq .
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.orderId')
echo "Order ID: $ORDER_ID"

echo -e "\n=== Step 3: Get Order Status ==="
curl -s -X GET $BASE_URL/api/orders/$ORDER_ID | jq .

echo -e "\n=== Step 4: Confirm Order ==="
CAPTURE_RESPONSE=$(curl -s -X POST $BASE_URL/api/orders/$ORDER_ID/confirm \
  -H "Content-Type: application/json" \
  -d '{}')
echo $CAPTURE_RESPONSE | jq .
CAPTURE_ID=$(echo $CAPTURE_RESPONSE | jq -r '.data.captureId')
echo "Capture ID: $CAPTURE_ID"

echo -e "\n=== Step 5: Refund Payment ==="
curl -s -X POST $BASE_URL/api/payments/$CAPTURE_ID/refund \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "currency": "USD",
    "description": "Partial refund"
  }' | jq .

echo -e "\n=== Test Complete ==="
```

Save as `test-flow.sh` and run:
```bash
chmod +x test-flow.sh
./test-flow.sh
```

---

## Error Handling Examples

### Invalid Request
```bash
curl -X POST $BASE_URL/api/payment-links \
  -H "Content-Type: application/json" \
  -d '{"currency": "USD"}'  # missing amount
```

**Response:**
```json
{
  "success": false,
  "error": "amount and currency are required"
}
```

### Invalid Order ID
```bash
curl -X GET $BASE_URL/api/orders/invalid_order_id
```

**Response:**
```json
{
  "success": false,
  "error": "Failed to get order status"
}
```

---

## Tips

- Use `jq` to format JSON responses: `curl ... | jq .`
- Save response values: `ORDER_ID=$(curl ... | jq -r '.data.orderId')`
- Add `-v` flag for verbose output: `curl -v -X POST ...`
- Add `-H "Authorization: Bearer TOKEN"` if authentication is required
- Amounts are in cents (5000 = $50.00)

