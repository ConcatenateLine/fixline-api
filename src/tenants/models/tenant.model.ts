import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TenantModel {
    @Field(() => Int)
    id: number;

    @Field()
    domain: string;  

    @Field()
    createdAt: Date;
}
