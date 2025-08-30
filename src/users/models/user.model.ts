import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserModel {
  @Field()
  id: number;

  @Field({ nullable: true })
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Int], { nullable: true })
  memberships?: any[]
}
