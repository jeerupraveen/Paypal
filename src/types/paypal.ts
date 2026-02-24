// PayPal API Response Types
export interface PayPalOrderRequest {
  intent: string;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
  application_context?: {
    locale?: string;
    brand_name?: string;
  };
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links?: Array<{
    rel: string;
    href: string;
    method?: string;
  }>;
}

export interface PayPalConfirmResponse {
  id: string;
  status: string;
  payer?: {
    email_address?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  purchase_units?: Array<{
    amount?: {
      currency_code: string;
      value: string;
    };
    payments?: {
      captures: Array<{
        id: string;
        status: string;
        amount?: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

export interface PayPalStatusResponse {
  id: string;
  status: string;
  payer?: {
    email_address?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  purchase_units?: Array<{
    amount?: {
      currency_code: string;
      value: string;
    };
    payments?: {
      captures: Array<{
        id: string;
        status: string;
        amount?: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

export interface PayPalRefundResponse {
  id: string;
  status: string;
  links?: Array<{
    rel: string;
    href: string;
    method?: string;
  }>;
}

export interface OrderData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  metadata?: any;
  returnUrl?: string;
}
export interface PayPalPaymentLinkRequest {
  amount: number;
  currency: string;
  description?: string;
  reference_id?: string;
  expire_after?: number;
}

export interface PayPalPaymentLinkResponse {
  id: string;
  status: string;
  payment_link?: string;
  links?: Array<{
    rel: string;
    href: string;
    method?: string;
  }>;
}
export interface RefundData {
  amount: number;
  currency: string;
  description?: string;
  metadata?: any;
}
