import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserAuthModel {
  @Field()
  id: number;

  @Field({ nullable: true })
  name: string;

  @Field()
  email: string;

  @Field(() => [String], { nullable: true })
  memberships?: string[];
}
