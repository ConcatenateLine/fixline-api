import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CreateResponse {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  memberships: string[];
}
