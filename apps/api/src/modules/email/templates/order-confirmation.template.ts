import { baseEmailTemplate } from './base.template';
import { OrderEmailData } from '../email.service';

export function orderConfirmationTemplate(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td>
        ${item.image ? `<img src="${item.image}" alt="" style="width:48px;height:48px;border-radius:6px;object-fit:cover;margin-right:12px;vertical-align:middle;" />` : ''}
        <span style="vertical-align:middle;">
          <strong>${item.name}</strong>
          ${item.variant ? `<br /><span style="color:#71717a;font-size:12px;">${item.variant}</span>` : ''}
          <br /><span style="color:#71717a;font-size:12px;">SKU: ${item.sku}</span>
        </span>
      </td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">$${item.unitPrice.toFixed(2)}</td>
      <td style="text-align:right;"><strong>$${item.total.toFixed(2)}</strong></td>
    </tr>`,
    )
    .join('');

  const content = `
    <div class="header">
      <h1>${data.storeName}</h1>
      <p>Order Confirmation</p>
    </div>
    <div class="body">
      <p style="font-size:16px;">Hi ${data.customerName},</p>
      <p style="margin-top:8px;color:#52525b;">Thank you for your order! We've received it and will begin processing shortly.</p>

      <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:24px 0;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p class="section-title" style="margin-bottom:4px;">Order Number</p>
          <p style="font-size:18px;font-weight:700;">${data.orderNumber}</p>
        </div>
        <div style="text-align:right;">
          <p class="section-title" style="margin-bottom:4px;">Order Date</p>
          <p style="font-size:14px;">${data.orderDate}</p>
        </div>
        <span class="badge badge-success">Confirmed</span>
      </div>

      <p class="section-title">Items Ordered</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <hr class="divider" />

      <div style="max-width:280px;margin-left:auto;">
        <div class="summary-row"><span>Subtotal</span><span>$${data.subtotal.toFixed(2)}</span></div>
        ${data.discountAmount > 0 ? `<div class="summary-row" style="color:#16a34a;"><span>Discount${data.couponCode ? ` (${data.couponCode})` : ''}</span><span>-$${data.discountAmount.toFixed(2)}</span></div>` : ''}
        <div class="summary-row"><span>Shipping</span><span>${data.shippingCost === 0 ? '<span style="color:#16a34a;">Free</span>' : `$${data.shippingCost.toFixed(2)}`}</span></div>
        <div class="summary-row"><span>Tax</span><span>$${data.taxAmount.toFixed(2)}</span></div>
        <div class="summary-row total"><span>Total</span><span>$${data.total.toFixed(2)}</span></div>
      </div>

      <hr class="divider" />

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
        <div>
          <p class="section-title">Shipping Address</p>
          <div class="address-block">
            ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br />
            ${data.shippingAddress.addressLine1}<br />
            ${data.shippingAddress.addressLine2 ? data.shippingAddress.addressLine2 + '<br />' : ''}
            ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br />
            ${data.shippingAddress.country}
            ${data.shippingAddress.phone ? `<br />${data.shippingAddress.phone}` : ''}
          </div>
        </div>
        <div>
          <p class="section-title">Payment</p>
          <div class="address-block">
            <strong>${data.paymentMethod}</strong>
            ${data.trackingNumber ? `<br /><br /><strong>Tracking:</strong><br />${data.trackingNumber}` : ''}
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-top:32px;">
        <a href="${data.storeUrl}/orders/${data.orderNumber}" class="btn">View Order Status</a>
      </div>
    </div>
  `;

  return baseEmailTemplate(content, data.storeName, data.storeUrl);
}
