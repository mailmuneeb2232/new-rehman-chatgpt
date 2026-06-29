#!/usr/bin/env bash
set -euo pipefail

REQUIRED_VARS=(
  "DATABASE_URL"
  "REDIS_URL"
  "JWT_ACCESS_PRIVATE_KEY"
  "JWT_ACCESS_PUBLIC_KEY"
  "JWT_REFRESH_SECRET"
  "CLOUDINARY_CLOUD_NAME"
  "CLOUDINARY_API_KEY"
  "CLOUDINARY_API_SECRET"
  "CLOUDINARY_UPLOAD_PRESET"
  "SMTP_HOST"
  "SMTP_USER"
  "SMTP_PASS"
  "SMTP_FROM_EMAIL"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "COOKIE_SECRET"
  "ENCRYPTION_KEY"
)

MISSING=()
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR:-}" ]; then
    MISSING+=("$VAR")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "Missing required environment variables:"
  for VAR in "${MISSING[@]}"; do
    echo "  - $VAR"
  done
  exit 1
fi

echo "All required environment variables are set."
