import * as React from 'react';

interface OrderShippedEmailProps {
  name: string;
  orderNumber: string;
  trackingNumber: string;
}

export function OrderShippedEmail({ name, orderNumber, trackingNumber }: OrderShippedEmailProps) {
  return (
    <div>
      <h1>Your order is on its way!</h1>
      <p>Hi {name}, order {orderNumber} has shipped. Tracking: {trackingNumber}</p>
    </div>
  );
}
