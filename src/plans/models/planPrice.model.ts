import { Field, ObjectType } from '@nestjs/graphql';
import { PlanModel } from 'src/plans/models/plans.model';

@ObjectType()
export class PlanPriceModel {
  @Field()
  id: string;

  @Field()
  provider: string;

  @Field()
  productId: string;

  @Field()
  priceId: string;

  @Field()
  interval: string;

  @Field()
  amountCents: number;

  @Field()
  currency: string;

  @Field()
  active: boolean;

  @Field()
  plan: PlanModel;
}
