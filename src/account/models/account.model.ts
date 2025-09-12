import { Field, ObjectType } from '@nestjs/graphql';
import { TenantModel } from 'src/tenants/models/tenant.model';
import { UserModel } from 'src/users/models/user.model';
import { SubscriptionModel } from 'src/subscriptions/models/subscription.model';

@ObjectType()
export class AccountModel {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  maxTenants: number;

  @Field()
  tenantsUsed: number;

  @Field()
  subscriptions?: SubscriptionModel[];

  @Field()
  tenants?: TenantModel[];

  @Field()
  userEmail?: string | null;

  @Field()
  user?: UserModel;
}
