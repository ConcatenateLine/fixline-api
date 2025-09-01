# 🛡️ Auth Module

## Purpose

Handles user authentication, registration, JWT authentication with passport, and role-based access control across tenants.

## Structure

### Core Modules

- `auth.module.ts` – Main module definition and JWT guard setup

### Authentication Flows

- `signIn/` – Handles user sign-in process
- `register/` – Handles user registration (Unique email validation)

### Security

- `validate/` – Credential validation

### Guards & Strategies

- `guards/`
  - `gqlAuth.guard.ts` – Validates GraphQL authentication
  - `jwtAuth.guard.ts` – Validates JWT tokens (Set global guard in auth.module.ts)

- `strategies/`
  - `jwt.strategy.ts` – JWT authentication strategy
  - `local.strategy.ts` – Local (email/password) strategy

### Utilities

- `decorators/`
  - `currentUser.decorator.ts` – Gets current authenticated user
  - `public.decorator.ts` – Marks a route as public (for JWT global guard)

- `interfaces/`
  - `jwtPayload.interface.ts` – JWT token payload structure

- `models/`
  - `userAuth.model.ts` – User authentication model

## Environment Variables

```env
JWT_SECRET=your-secret-key
TOKEN_EXPIRY=3600s  # Token expiration time in seconds
```

## Features

- 🔐 JWT-based authentication
- 🔑 Secure password hashing with bcrypt

## Usage

1. Register new users via `/auth/register`
2. Authenticate via `/auth/signin` to get JWT token
3. Use the token in `Authorization: Bearer <token>` header for protected routes
