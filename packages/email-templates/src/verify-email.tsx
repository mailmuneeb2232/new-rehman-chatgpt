import * as React from 'react';

interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export function VerifyEmail({ name, verifyUrl }: VerifyEmailProps) {
  return (
    <div>
      <h1>Verify your email</h1>
      <p>Hi {name}, click the link below to verify your email address.</p>
      <a href={verifyUrl}>Verify Email</a>
    </div>
  );
}
