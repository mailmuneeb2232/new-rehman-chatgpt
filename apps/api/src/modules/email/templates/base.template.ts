export function baseEmailTemplate(content: string, storeName = 'Electronic Store', storeUrl = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${storeName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif; background-color: #f4f4f5; color: #18181b; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
    .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .header { background: #09090b; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: #a1a1aa; font-size: 13px; margin-top: 4px; }
    .body { padding: 40px; }
    .footer { background: #f4f4f5; padding: 24px 40px; text-align: center; }
    .footer p { color: #71717a; font-size: 12px; line-height: 1.6; }
    .footer a { color: #3f3f46; text-decoration: none; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef9c3; color: #854d0e; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 24px 0; }
    .btn { display: inline-block; padding: 12px 28px; background: #09090b; color: #ffffff !important; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
    .section-title { font-size: 13px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    table.data-table { width: 100%; border-collapse: collapse; }
    table.data-table th { text-align: left; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 0; border-bottom: 1px solid #e4e4e7; }
    table.data-table td { padding: 12px 0; border-bottom: 1px solid #f4f4f5; font-size: 14px; vertical-align: middle; }
    .address-block { background: #f4f4f5; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px; }
    .summary-row.total { font-weight: 700; font-size: 16px; padding-top: 12px; border-top: 2px solid #09090b; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
      ${storeUrl ? `<p style="margin-top:8px"><a href="${storeUrl}">${storeUrl}</a></p>` : ''}
      <p style="margin-top:8px; color:#a1a1aa;">You received this email because you placed an order with us.</p>
    </div>
  </div>
</body>
</html>
`;
}
