# Payment Module

A flexible payment processing module that supports multiple payment providers through a unified interface.

## Features

- **Multi-provider Support**: Currently supports Stripe and PayPal payment processors
- **Unified Interface**: Common interface for all payment processors
- **Easy Integration**: Simple dependency injection pattern for usage in other modules

## Supported Processors

1. **Stripe**
   - Secure credit card payments
   - Subscription management
   - Webhook support (Implemented on Billing Module)

2. **PayPal**
   - PayPal payments
   - Subscription handling
   - Webhook support (Not implemented)

## Usage

### Configuration

Required environment variables:

```bash
# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_API_VERSION=2025-08-27.basil

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Frontend
FRONTEND_URL=[http://your-frontend-url.com](http://your-frontend-url.com)
```

### Architecture

```
payment/
├── interfaces/
│   └── paymentProcessor.interface.ts   # Base interface for all payment processors
├── processors/
│   ├── stripe.processor.ts     # Stripe payment processor implementation
│   └── paypal.processor.ts     # PayPal payment processor implementation
└── payment.module.ts           # Module definition
```

## Dependencies

- @nestjs/common: Core NestJS functionality
- @nestjs/config: Configuration management
- stripe: Stripe Node.js library
- @prisma/client: Database client (for plan and price lookup)

## Extending the Payment Module

To add a new payment processor:

1. Create a new processor class in the processors directory
2. Implement the `PaymentProcessor` interface
3. Add the processor to the `PAYMENT_PROCESSORS` provider in payment.module.ts
