import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FindInput {
  @Field()
  email: string;
}
