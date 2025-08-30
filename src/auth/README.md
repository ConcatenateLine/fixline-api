# 🛡️ Auth Module

## Purpose
Handles authentication, JWT strategy, and role-based access control across tenants.

## Structure
- `auth.module.ts` – Main module definition
- `auth.service.ts` – Login, token generation, and validation
- `jwt.strategy.ts` – Parses and validates tenant-aware JWTs
- `roles.guard.ts` – Enforces role-based access
- `tenant.guard.ts` – Ensures tenant isolation on protected routes

## Environment Variables
```env
AUTH_SECRET=your-secret-key
TOKEN_EXPIRY=3600s
