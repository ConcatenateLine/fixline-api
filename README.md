[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](/LICENSE)

# 🎫 FixLine-API

A modular, multi-tenant backend for managing support tickets across organizations. Built with NestJS and GraphQL, designed for scalable SaaS deployment, secure tenant isolation, and seamless integration with decoupled frontend clients.

---

## 📦 Architecture Overview

- **Framework**: NestJS (TypeScript)
- **API Layer**: GraphQL (Apollo Server)
- **Design**: Modular structure with folders for `auth`, `tenants`, `tickets`, `users`, `comments`, etc.
- **Database**: PostgreSQL (recommended), using Prisma or TypeORM
- **Multi-Tenancy**: Scoped access via `tenant_id`, injected into GraphQL context
- **Auth**: JWT-based authentication with tenant-aware role-based access control
- **Billing**: Optional Stripe integration for subscription tiers
- **Rate Limiting**: Per-tenant API quotas (e.g., ticket creation, agent count)
- **Frontend**: Decoupled clients
- **Docs**: GraphQL schema introspection + optional Swagger for REST fallback

---

## 🧑‍💼 Role Aggregates & Access Model

FixLine supports scoped user roles per tenant, enabling fine-grained access control and modular service isolation.

### 🔐 Supported Roles

| Role    | Description                                     | Permissions Summary                          | Create By     |
| ------- | ----------------------------------------------- | -------------------------------------------- | ------------- |
| ADMIN   | Full operational control over tenant            | Manage users, tickets, and tenant settings   | SYSTEM        |
| MANAGER | Oversees ticket workflows and agent assignments | Assign tickets, view reports, manage agents  | ADMIN         |
| AGENT   | Handles assigned tickets                        | View/edit tickets, limited user visibility   | MANAGER/ADMIN |
| VIEWER  | Read-only access to tenant data                 | Create/view tickets, limited user visibility | MANAGER/ADMIN |
| GUEST   | Temporary or limited access                     | View public info, no ticket interaction      | ANY           |

### 🧮 Role Aggregates

Roles are aggregated per tenant, allowing users to hold different roles across multiple tenants.

```typescript
// Example: User with multiple tenant roles
{
  id: "user_123",
  memberships: [
    { tenantId: "acme", role: "ADMIN" },
    { tenantId: "globex", role: "AGENT" },
    { tenantId: "umbrella", role: "GUEST" }
  ]
}
```

### 🧪 Testing & Seed Data

The seed script includes sample users with varied role aggregates to support testing of:

- Role-based guards and GraphQL resolvers
- Multi-tenant UI flows and permission checks
- Onboarding scenarios with scoped access

---

## 🧩 GraphQL Modules & Schema Overview

FixLine's GraphQL API is organized into modular domains, each representing a core business capability. All operations are scoped by `tenant_id` to ensure strict data isolation across organizations.

---

### 🏢 Tenants

| Operation      | Description                       |
| -------------- | --------------------------------- |
| `createTenant` | Create a new organization         |
| `getTenant`    | View tenant details               |
| `updateTenant` | Update subscription or settings   |
| `deleteTenant` | Delete organization (soft-delete) |

---

### 🔐 Authentication

| Operation  | Description                     |
| ---------- | ------------------------------- |
| `login`    | Login scoped to tenant          |
| `register` | Register user under tenant      |
| `me`       | Validate token and tenant scope |

---

### 🎟️ Tickets

| Operation      | Description                            |
| -------------- | -------------------------------------- |
| `tickets`      | List tickets for current tenant        |
| `createTicket` | Create ticket within tenant            |
| `updateTicket` | Update ticket (status, assignee, etc.) |

---

### 💬 Comments & Activity

| Operation       | Description                 |
| --------------- | --------------------------- |
| `addComment`    | Add comment to ticket       |
| `getComments`   | Fetch ticket comments       |
| `ticketHistory` | View audit trail (optional) |

---

### 👥 Users & Teams

| Operation    | Description                |
| ------------ | -------------------------- |
| `users`      | List users/agents          |
| `getUser`    | View user profile          |
| `updateUser` | Update user roles/settings |
| `teams`      | List support teams         |

---

### 🏷️ Metadata

| Operation    | Description       |
| ------------ | ----------------- |
| `categories` | Ticket categories |
| `tags`       | Custom tags       |
| `priorities` | Priority levels   |

---

### 🔔 Notifications & Webhooks

| Operation          | Description                |
| ------------------ | -------------------------- |
| `triggerWebhook`   | Trigger test notification  |
| `sendNotification` | Manual dispatch (optional) |

---

### 🔐 Security & Isolation

| Feature              | Description                                         |
| -------------------- | --------------------------------------------------- |
| Tenant Context       | All resolvers scoped via `x-tenant-id` header       |
| Role-Based Guards    | Field-level access control based on user roles      |
| Query Depth Limiting | Prevents abuse via nested queries                   |
| Cost Analysis        | Optional query cost throttling for enterprise plans |

---

### 🔄 Schema Evolution

| Strategy          | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| Additive Changes  | New fields added without breaking existing clients          |
| Deprecation Flags | Deprecated fields marked clearly before removal             |
| Persisted Queries | Stable query contracts for frontend and third-party clients |
| Federation Ready  | Compatible with Apollo Federation for microservice scaling  |

---

## 🧠 SaaS-Specific Features

- **Tenant Isolation**: All data queries scoped by `tenant_id`
- **Subscription Tiers**:
  - Free: 3 agents, 100 tickets/month
  - Pro: Unlimited agents, SLA tracking
- **Audit Logging**: Per-tenant activity logs
- **Custom Domains**: Optional white-labeling
- **Usage Metrics**: Track ticket volume, agent activity, SLA compliance

---

## 🚀 Setup & Run

# Environment variables

TENANT*MODE=multi
DATABASE_URL=postgres://...
STRIPE_KEY=sk_test*...

# Install dependencies

pnpm install

# Start development server

pnpm run start:dev

# GraphQL Playground

http://localhost:3000/graphql

```

> ⚠️ This repository is private and intended solely for internal use by Josue Morales Pascual. Do not fork, clone, or redistribute without explicit permission.
```
