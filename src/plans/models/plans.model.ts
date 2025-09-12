import { Field, ObjectType } from '@nestjs/graphql';
import { SubscriptionModel } from 'src/subscriptions/models/subscription.model';
import { PlanPriceModel } from 'src/plans/models/planPrice.model';

@ObjectType()
export class PlanModel {
  @Field()
  id: string;

  @Field()
  key: string;

  @Field()
  name: string;

  @Field()
  maxTenants: number;

  @Field()
  active: boolean;

  @Field()
  sortOrder: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  prices?: PlanPriceModel[];

  @Field()
  subscriptions?: SubscriptionModel[];
}
