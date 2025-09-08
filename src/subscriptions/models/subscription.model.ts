import { Field, ObjectType } from '@nestjs/graphql';
import { AccountModel } from 'src/account/models/account.model';
import { PlanModel } from 'src/plans/models/plans.model';
import { BillingEventModel } from 'src/subscriptions/models/billingEvent.model';

@ObjectType()
export class SubscriptionModel {
  @Field()
  id: string;

  @Field()
  provider: string;

  @Field()
  customerId: string;

  @Field()
  subscriptionId: string;

  @Field()
  priceId: string;

  @Field()
  status: string;

  @Field()
  periodStart: Date;

  @Field()
  periodEnd: Date;

  @Field()
  account: AccountModel;

  @Field()
  plan: PlanModel;

  @Field()
  billingEvents: BillingEventModel[];
}
