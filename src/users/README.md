# Users Module

## Purpose

User management,

## Structure

### Core Modules

- `users.module.ts` – Main module definition

### User Flows

- `user/checkOut/` – User checkout process, user chooses a plan. Backend creates a checkout session with metadata `{ userId, planId }`. Return `checkoutUrl` to client.

```seqdiag
seqdiag {
  user        -> api         [label = "POST /user/checkOut (planId)"];
  api         -> payment     [label = "createCheckout(userId, planId)"];
  payment    --> api         [label = "CheckoutResult(url)"];
  api        --> user        [label = "200 { url }"];
}
```
