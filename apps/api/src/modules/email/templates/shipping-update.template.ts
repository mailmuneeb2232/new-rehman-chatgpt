import { baseEmailTemplate } from './base.template';

const STATUS_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  SHIPPED: { label: 'Your order has been shipped!', icon: '&#128666;', color: '#1e40af' },
  OUT_FOR_DELIVERY: { label: 'Out for delivery today!', icon: '&#128230;', color: '#d97706' },
  DELIVERED: { label: 'Your order has been delivered!', icon: '&#9989;', color: '#16a34a' },
};

export function shippingUpdateTemplate(data: {
  firstName: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  storeName?: string;
  storeUrl?: string;
}): string {
  const storeName = data.storeName ?? 'Electronic Store';
  const storeUrl = data.storeUrl ?? '';
  const statusInfo = STATUS_LABELS[data.status] ?? { label: `Order status: ${data.status}`, icon: '&#128230;', color: '#3f3f46' };

  const content = `
    <div class="header">
      <h1>${storeName}</h1>
      <p>Shipping Update</p>
    </div>
    <div class="body">
      <div style="text-align:center;padding:16px 0;">
        <p style="font-size:48px;">${statusInfo.icon}</p>
        <p style="font-size:20px;font-weight:700;margin-top:12px;color:${statusInfo.color};">${statusInfo.label}</p>
      </div>

      <p style="margin-top:8px;color:#52525b;">Hi ${data.firstName}, here's an update on your order <strong>${data.orderNumber}</strong>.</p>

      ${data.trackingNumber ? `
      <div style="background:#f4f4f5;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
        <p class="section-title" style="margin-bottom:8px;">Tracking Number</p>
        <p style="font-size:18px;font-weight:700;font-family:monospace;">${data.trackingNumber}</p>
        ${data.trackingUrl ? `<a href="${data.trackingUrl}" class="btn" style="margin-top:16px;display:inline-block;">Track Shipment</a>` : ''}
      </div>` : ''}

      <div style="text-align:center;margin-top:28px;">
        <a href="${storeUrl}/orders/${data.orderNumber}" class="btn">View Order Details</a>
      </div>
    </div>
  `;

  return baseEmailTemplate(content, storeName, storeUrl);
}
