import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserAuthModel {
  @Field({ nullable: true })
  name: string;

  @Field()
  email: string;

  @Field(() => [Int], { nullable: true })
  memberships?: any[]
}
