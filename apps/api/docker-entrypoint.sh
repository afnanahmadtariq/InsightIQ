#!/bin/sh
set -eu

npx prisma migrate deploy --config packages/db/prisma.config.ts
exec node apps/api/dist/main.js
