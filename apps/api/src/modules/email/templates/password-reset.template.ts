import { baseEmailTemplate } from './base.template';

export function passwordResetTemplate(data: { firstName: string; resetUrl: string; expiresIn: string; storeName?: string; storeUrl?: string }): string {
  const storeName = data.storeName ?? 'Electronic Store';
  const storeUrl = data.storeUrl ?? '';

  const content = `
    <div class="header">
      <h1>${storeName}</h1>
      <p>Password Reset Request</p>
    </div>
    <div class="body">
      <p style="font-size:16px;">Hi ${data.firstName},</p>
      <p style="margin-top:12px;color:#52525b;line-height:1.7;">We received a request to reset the password for your account. Click the button below to choose a new password.</p>

      <div style="background:#fef9c3;border-radius:8px;padding:16px;margin:24px 0;">
        <p style="color:#854d0e;font-size:14px;">&#9888;&nbsp; This link will expire in <strong>${data.expiresIn}</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${data.resetUrl}" class="btn">Reset Password</a>
      </div>

      <p style="font-size:13px;color:#71717a;">Or copy and paste this URL into your browser:</p>
      <p style="font-size:12px;color:#3f3f46;word-break:break-all;background:#f4f4f5;padding:12px;border-radius:6px;margin-top:8px;">${data.resetUrl}</p>
    </div>
  `;

  return baseEmailTemplate(content, storeName, storeUrl);
}
