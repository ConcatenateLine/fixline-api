import { Field, ObjectType } from '@nestjs/graphql';
import { SubscriptionModel } from 'src/subscriptions/models/subscription.model';

@ObjectType()
export class BillingEventModel {
  @Field()
  id: string;

  @Field()
  provider: string;

  @Field()
  eventId: string;

  @Field()
  type: string;

  @Field()
  receivedAt: Date;

  @Field()
  raw: any;

  @Field()
  subscription: SubscriptionModel;
}
