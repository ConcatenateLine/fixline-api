import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class CreateResponse {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => [String], { nullable: true })
  memberships?: string[];
}
