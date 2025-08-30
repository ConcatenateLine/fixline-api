import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { SignInResponse } from './signIn.response';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SignInInput } from './signIn.input';

@Resolver()
export class SignInResolver {
  constructor() { }

  @Mutation(() => SignInResponse)
  @UseGuards(AuthGuard('local'))
  async signIn(@Args('input') input: SignInInput, @Context() { user }: { user: any }): Promise<SignInResponse> {
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return user;
  }
}
