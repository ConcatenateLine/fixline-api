import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SignInResponse {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => [String], { nullable: true })
  memberships?: string[];
}
