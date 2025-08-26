import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserModel {
    @Field(() => Int)
    id: number;

    @Field({ nullable: true })
    name?: string;

    @Field()
    email: string;

    @Field()
    createdAt: Date;
}