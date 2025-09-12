# Billing Module

A flexible billing system that handles payment processing, webhook handling, and subscription management through multiple payment providers.

## 📁 Module Structure

```
billing/
├── stripe/                    # Stripe payment provider implementation
│   ├── stripe.controller.ts   # Webhook and API endpoints
│   ├── stripe.module.ts       # Stripe module definition
│   └── stripe.service.ts      # Core Stripe service logic
└── billing.module.ts          # Root billing module
```

### Flows

- **Webhook: Payment Success (Stripe)**
  1. Verify signature.
  2. Resolve `userId` and `planId` from metadata/event.
  3. If no Account exists for user: create `Account { ownerUserId, maxTenants, tenantsUsed: 0, billing fields }`.
     - If Account exists: update billing fields and `maxTenants` per plan.
  4. Mark `status = active`.

## 🚀 Features

- **Multi-provider Support**: Currently supports Stripe with extensible architecture
- **Webhook Handling**: Secure processing of payment provider webhooks
- **Subscription Management**: Integration with subscription lifecycle
- **Payment Processing**: Handle one-time and recurring payments

## 🔌 Integrations

### Stripe

- **Webhook Endpoint**: `POST /stripe/webhook`
- **Events Handled**:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

## 📦 Dependencies

- `@nestjs/common`: Core NestJS functionality
- `stripe`: Stripe Node.js client library
- `@prisma/client`: Database ORM
- `@nestjs/config`: Configuration management

## 🔧 Environment Variables

```env
# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_signing_secret
```

## 🔒 Security

- All webhook endpoints verify the request signature
