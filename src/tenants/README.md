# Tenants Module

A lightweight multi-tenant foundation for the API. This module currently provides GraphQL models for tenants and memberships, plus a simple guard to enforce tenant scoping via request headers.

## Contents

- `tenants.module.ts` — Nest module declaration
- `models/tenant.model.ts` — GraphQL `TenantModel`
- `models/tenantMembership.model.ts` — GraphQL `TenantMembershipModel`
- `guards/tenant.guard.ts` — `TenantGuard` that checks the `x-tenant-id` header

## Data Model (Prisma)

Defined in `prisma/models/tenants.prisma` and `prisma/models/tenantMembership.prisma`:

```prisma
model Tenant {
  id           String   @id @default(uuid())
  name         String
  slug         String   @unique
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  contactEmail String?
  isActive     Boolean  @default(true)

  memberships  TenantMembership[]

  @@index([slug])
}
```

Memberships link users to tenants and carry a role (see `src/common/enums/role.enum`).

## GraphQL Types

From `src/tenants/models/tenant.model.ts`:

```ts
@ObjectType()
export class TenantModel {
  @Field() id: string;
  @Field() name: string;
  @Field() slug: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() isActive: boolean;
  @Field(() => String, { nullable: true }) contactEmail?: string;
  @Field(() => [TenantMembershipModel], { nullable: true }) memberships?: TenantMembershipModel[];
}
```

From `src/tenants/models/tenantMembership.model.ts`:

```ts
@ObjectType()
export class TenantMembershipModel {
  @Field() id: string;
  @Field() tenantId: string;
  @Field() userId: number;
  @Field() role: Role; // from src/common/enums/role.enum
  @Field() joinedAt: Date;
  @Field(() => TenantModel) tenant: TenantModel;
  @Field(() => UserModel) user: UserModel;
}
```

## Tenant Guard

`src/tenants/guards/tenant.guard.ts` enforces that the authenticated user belongs to the tenant specified in the `x-tenant-id` header.

- Requires header: `x-tenant-id: <tenant-uuid>`
- Compares `request.user.tenantId` with the header value

```ts
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers['x-tenant-id'];
    return user.tenantId === tenantId;
  }
}
```

Apply it at resolver/controller level:

```ts
@UseGuards(TenantGuard)
@Query(() => TenantModel)
getTenant(/* args */) { /* ... */ }
```

## Module Setup

The module is declared in `src/tenants/tenants.module.ts` and is ready to be imported into `AppModule` (or feature modules). Wire your resolvers/services here as they are implemented.

```ts
@Module({})
export class TenantsModule {}
```

## Usage Notes

- Always send `x-tenant-id` with requests that access tenant-scoped resources.
- Ensure your authentication layer attaches `user` to the request with a `tenantId` field.
- Consider normalizing tenant resolution (e.g., by domain or slug) and mapping to `tenantId` before guard execution.

## Roadmap / TODO

- Add Tenant queries/mutations (create, update, list, activate/deactivate)
- Add Membership management (invite, change role, remove)
- Centralize tenant resolution (by domain, slug, or header) with a dedicated interceptor/service
- E2E tests covering header-based tenant scoping
- Data access layer using Prisma with tenant-aware filters

## Flows

- __Create Tenant (paid)__
  1. User completes checkout for a plan (maps to `seatLimit`).
  2. Payment webhook validates event and creates the tenant and owner membership:
     - Create `Tenant` with `ownerUserId`, `seatLimit`, `seatUsed = 1`.
     - Create `TenantMembership` for the creator with role `OWNER`.

- __Invite User__
  1. Caller must be `OWNER` or `ADMIN` of the tenant.
  2. Check seats: `seatUsed < seatLimit` (optionally also count pending invites).
  3. Create or upsert an invite with a token and expiry; email the link to the invitee.
  4. On acceptance: verify token and expiry, re-check seats in a transaction, create membership, increment `seatUsed`, mark invite accepted.

- __Remove Member__
  - Caller must be `OWNER` or `ADMIN`.
  - Removing a member decrements `seatUsed`.
  - Do not allow removing the `OWNER`.

## Authorization

- __Tenant scoping__: Keep `TenantGuard` to enforce `request.user.tenantId === x-tenant-id`.
- __Role checks__: Add a role-based guard, e.g., `TenantRolesGuard`, with a decorator `@TenantRoles(OWNER, ADMIN)` for mutations like invites/removals.
- __Where to check__: Always re-check seat limits and roles inside service methods as well (defense in depth).

Example decorator and guard usage at resolver level:

```ts
@UseGuards(TenantGuard, TenantRolesGuard)
@TenantRoles(Role.OWNER, Role.ADMIN)
@Mutation(() => Boolean)
inviteUser(@Args('tenantId') tenantId: string, @Args('email') email: string, @Args('role') role: Role) {
  return this.tenantsService.inviteUser({ tenantId, email, role });
}
```

## GraphQL API Examples

- __Create Tenant__ (typically triggered after a successful billing webhook; exposing a public mutation is optional and should be protected if used):

```graphql
mutation CreateTenant($input: CreateTenantInput!) {
  createTenant(input: $input) {
    id
    name
    slug
    isActive
    seatLimit
    seatUsed
  }
}
```

- __Invite User__:

```graphql
mutation InviteUser($tenantId: String!, $email: String!, $role: Role!) {
  inviteUser(tenantId: $tenantId, email: $email, role: $role)
}
```

- __Accept Invite__:

```graphql
mutation AcceptInvite($token: String!) {
  acceptInvite(token: $token) {
    id
    name
    memberships { id user { id } role }
  }
}
```

- __Seat Info__:

```graphql
query SeatInfo($tenantId: String!) {
  seatInfo(tenantId: $tenantId) { seatLimit seatUsed }
}
```

- __Members__:

```graphql
query TenantMembers($tenantId: String!) {
  tenantMembers(tenantId: $tenantId) {
    id
    role
    user { id email }
  }
}
```

## Suggested Prisma Additions

Augment `prisma/models/tenants.prisma` (example fields):

```prisma
model Tenant {
  id           String   @id @default(uuid())
  name         String
  slug         String   @unique
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  contactEmail String?
  isActive     Boolean  @default(true)

  // ownership & seats
  ownerUserId  Int
  seatLimit    Int
  seatUsed     Int      @default(1)

  memberships  TenantMembership[]
  invites      TenantInvite[]

  @@index([slug])
  @@index([ownerUserId])
}

enum InviteStatus { PENDING ACCEPTED EXPIRED CANCELED }

model TenantInvite {
  id         String       @id @default(uuid())
  tenantId   String
  email      String
  role       Role         @default(GUEST)
  invitedBy  Int
  token      String       @unique
  expiresAt  DateTime
  acceptedAt DateTime?
  status     InviteStatus @default(PENDING)

  tenant     Tenant       @relation(fields: [tenantId], references: [id])
}
```

Notes:
- Keep seat enforcement inside transactions when accepting invites or removing members.
- If you prefer not to reserve seats for pending invites, enforce on acceptance only.

## Service Responsibilities (sketch)

- __TenantsService.createTenant__ (invoked by billing webhook): create tenant, owner membership.
- __TenantsService.inviteUser__:
  - Assert caller role and tenant scope.
  - Check seats and create/upsert invite + email token.
- __TenantsService.acceptInvite__:
  - Verify token; transaction to re-check seats, create membership, increment `seatUsed`, mark invite accepted.
- __TenantsService.removeMember__:
  - Assert caller role; prevent removing owner; decrement `seatUsed`.

## Edge Cases

- Re-invite existing member: no-op success or return informative message.
- Duplicate pending invite: upsert and extend expiry instead of creating multiple rows.
- Expired tokens: allow resend if seats available.
- Plan changes: update `seatLimit`; new invites must respect the new limit.