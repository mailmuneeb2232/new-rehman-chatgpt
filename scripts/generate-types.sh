#!/usr/bin/env bash
set -euo pipefail

echo "Generating Prisma types..."
pnpx prisma generate --schema=database/prisma/schema.prisma

echo "Type generation complete."
