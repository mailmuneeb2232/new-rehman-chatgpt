import * as React from 'react';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <div>
      <h1>Reset your password</h1>
      <p>Hi {name}, click the link below to reset your password.</p>
      <a href={resetUrl}>Reset Password</a>
    </div>
  );
}
