import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <div>
      <h1>Welcome to Electronic Store, {name}!</h1>
      <p>Thank you for creating an account.</p>
    </div>
  );
}
