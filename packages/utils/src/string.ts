export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ES-${timestamp}-${random}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const masked = `${local.slice(0, 2)}${'*'.repeat(Math.max(0, local.length - 2))}`;
  return `${masked}@${domain}`;
}

export function maskCardNumber(last4: string): string {
  return `**** **** **** ${last4}`;
}
