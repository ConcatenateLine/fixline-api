import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class FindByEmailInput {
  @Field()
  email: string;
}
