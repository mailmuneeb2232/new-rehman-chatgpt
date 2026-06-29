import * as React from 'react';

interface OrderConfirmationEmailProps {
  name: string;
  orderNumber: string;
  total: string;
}

export function OrderConfirmationEmail({ name, orderNumber, total }: OrderConfirmationEmailProps) {
  return (
    <div>
      <h1>Order Confirmed — {orderNumber}</h1>
      <p>Hi {name}, your order for {total} has been confirmed.</p>
    </div>
  );
}
