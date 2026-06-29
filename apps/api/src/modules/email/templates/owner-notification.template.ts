import { baseEmailTemplate } from './base.template';
import { OrderEmailData } from '../email.service';

export function ownerNotificationTemplate(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
        <strong>${item.name}</strong>
        ${item.variant ? `<br/><span style="color:#71717a;font-size:12px;">${item.variant}</span>` : ''}
        <br/><span style="color:#71717a;font-size:12px;">SKU: ${item.sku}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;text-align:right;">$${item.unitPrice.toFixed(2)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;text-align:right;"><strong>$${item.total.toFixed(2)}</strong></td>
    </tr>`,
    )
    .join('');

  const content = `
    <div class="header" style="background:#1e40af;">
      <h1 style="color:#ffffff;">&#128226; New Order Received</h1>
      <p style="color:#bfdbfe;">Action Required — Process and Ship</p>
    </div>
    <div class="body">
      <div style="background:#eff6ff;border-radius:8px;padding:20px;margin-bottom:24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div><p style="font-size:12px;color:#1e40af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Order</p><p style="font-size:20px;font-weight:700;">${data.orderNumber}</p></div>
        <div><p style="font-size:12px;color:#1e40af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Date &amp; Time</p><p style="font-size:14px;">${data.orderDate}</p></div>
        <div><p style="font-size:12px;color:#1e40af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Total</p><p style="font-size:20px;font-weight:700;color:#1e40af;">$${data.total.toFixed(2)}</p></div>
        <div><p style="font-size:12px;color:#1e40af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Payment</p><p style="font-size:14px;">${data.paymentMethod}</p></div>
      </div>

      <p class="section-title">Customer Information</p>
      <div class="address-block" style="margin-bottom:24px;">
        <strong>${data.customerName}</strong><br />
        <a href="mailto:${data.customerEmail}" style="color:#1e40af;">${data.customerEmail}</a>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
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
          <p class="section-title">Billing Address</p>
          <div class="address-block">
            ${data.billingAddress
              ? `${data.billingAddress.firstName} ${data.billingAddress.lastName}<br />
              ${data.billingAddress.addressLine1}<br />
              ${data.billingAddress.addressLine2 ? data.billingAddress.addressLine2 + '<br />' : ''}
              ${data.billingAddress.city}, ${data.billingAddress.state} ${data.billingAddress.postalCode}<br />
              ${data.billingAddress.country}`
              : 'Same as shipping'}
          </div>
        </div>
      </div>

      <p class="section-title">Order Items</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:.05em;padding:8px 0;border-bottom:2px solid #e4e4e7;">Product</th>
            <th style="text-align:center;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:.05em;padding:8px 0;border-bottom:2px solid #e4e4e7;">Qty</th>
            <th style="text-align:right;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:.05em;padding:8px 0;border-bottom:2px solid #e4e4e7;">Unit</th>
            <th style="text-align:right;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:.05em;padding:8px 0;border-bottom:2px solid #e4e4e7;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="max-width:280px;margin:16px 0 0 auto;">
        <div class="summary-row"><span>Subtotal</span><span>$${data.subtotal.toFixed(2)}</span></div>
        ${data.discountAmount > 0 ? `<div class="summary-row" style="color:#16a34a;"><span>Discount${data.couponCode ? ` (${data.couponCode})` : ''}</span><span>-$${data.discountAmount.toFixed(2)}</span></div>` : ''}
        <div class="summary-row"><span>Shipping</span><span>${data.shippingCost === 0 ? 'Free' : `$${data.shippingCost.toFixed(2)}`}</span></div>
        <div class="summary-row"><span>Tax</span><span>$${data.taxAmount.toFixed(2)}</span></div>
        <div class="summary-row total"><span>Order Total</span><span style="color:#1e40af;">$${data.total.toFixed(2)}</span></div>
      </div>

      <div style="text-align:center;margin-top:32px;">
        <a href="${data.storeUrl}/admin/orders/${data.orderNumber}" class="btn" style="background:#1e40af;">View in Admin Panel</a>
      </div>
    </div>
  `;

  return baseEmailTemplate(content, data.storeName, data.storeUrl);
}
