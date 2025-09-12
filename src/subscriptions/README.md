# Subscriptions Module

A subscription management system that handles subscription lifecycle events, billing, and account associations with Stripe integration.

## 📁 Module Structure

```
subscriptions/
├── enums/
│   └── subscriptionStatus.enum.ts  # Subscription status definitions
├── models/
│   ├── billingEvent.model.ts      # Billing event model and types
│   └── subscription.model.ts      # Subscription model and types
├── register/                      # Subscription registration (Stripe)
│   ├── register.module.ts
│   └── register.service.ts
└── subscriptions.module.ts        # Root module
```

## 🚀 Features

- **Subscription Lifecycle Management**: Handle creation, updates, and cancellations
- **Stripe Integration**: Seamless payment processing with Stripe
- **Status Tracking**: Monitor subscription states (Active, Past Due, Canceled)
- **Idempotent Operations**: Safe for retries with built-in duplicate protection
- **Billing Event Logging**: Comprehensive tracking of all subscription-related events

## 📊 Subscription Statuses

| Status     | Description                                 | Stripe Equivalent |
| ---------- | ------------------------------------------- | ----------------- |
| `ACTIVE`   | Subscription is active and in good standing | `open`            |
| `PAST_DUE` | Payment failed, currently in grace period   | `completed`       |
| `CANCELED` | Subscription has been terminated            | `expired`         |

## 📦 Dependencies

- `@nestjs/common`: Core NestJS functionality
- `stripe`: Stripe Node.js client library
- `@prisma/client`: Database ORM for data persistence

## 📚 Related Modules

- `Payment Module`: Handles payment processing
- `Account Module`: Manages user accounts and associations
- `Billing Module`: Processes billing events and invoices

## UI/UX Notes

- If a user has no active Account subscription, show “Choose a plan” CTA.
- After payment success, show Account dashboard with quota status and a “Create tenant” button.
- If `tenantsUsed >= maxTenants`, show upgrade CTA.