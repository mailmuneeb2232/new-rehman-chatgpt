import { baseEmailTemplate } from './base.template';

export function welcomeTemplate(data: { firstName: string; email: string; storeUrl?: string; storeName?: string }): string {
  const storeName = data.storeName ?? 'Electronic Store';
  const storeUrl = data.storeUrl ?? '';

  const content = `
    <div class="header">
      <h1>${storeName}</h1>
      <p>Welcome to the family</p>
    </div>
    <div class="body">
      <p style="font-size:18px;font-weight:600;">Hi ${data.firstName}! &#127881;</p>
      <p style="margin-top:12px;color:#52525b;line-height:1.7;">Welcome to ${storeName}. Your account has been created and you're all set to start shopping the latest tech.</p>

      <div style="background:#f4f4f5;border-radius:12px;padding:24px;margin:28px 0;">
        <p style="font-weight:600;margin-bottom:16px;">What you can do with your account:</p>
        <ul style="list-style:none;padding:0;">
          <li style="padding:6px 0;color:#52525b;">&#10003;&nbsp; Track your orders in real time</li>
          <li style="padding:6px 0;color:#52525b;">&#10003;&nbsp; Save items to your wishlist</li>
          <li style="padding:6px 0;color:#52525b;">&#10003;&nbsp; Get personalised recommendations</li>
          <li style="padding:6px 0;color:#52525b;">&#10003;&nbsp; Manage your addresses and payment methods</li>
          <li style="padding:6px 0;color:#52525b;">&#10003;&nbsp; Leave reviews and earn loyalty points</li>
        </ul>
      </div>

      <div style="text-align:center;margin-top:28px;">
        <a href="${storeUrl}/shop" class="btn">Start Shopping</a>
      </div>

      <p style="margin-top:32px;font-size:13px;color:#71717a;">If you didn't create this account, please ignore this email.</p>
    </div>
  `;

  return baseEmailTemplate(content, storeName, storeUrl);
}
