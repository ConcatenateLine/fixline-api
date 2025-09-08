import { ObjectType, Field } from '@nestjs/graphql';
import { UserAuthModel } from 'src/auth/models/userAuth.model';

@ObjectType()
export class SignInResponse {
  @Field()
  access_token: string;

  @Field()
  user: UserAuthModel;
}
