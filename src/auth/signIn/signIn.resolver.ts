import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { SignInResponse } from './signIn.response';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { SignInInput } from './signIn.input';
import { SignInService } from './signIn.service';
import { GqlLocalAuthGuard } from '../guards/gqlLocalAuth.guard';
import { UserAuthModel } from '../models/userAuth.model';
import { CurrentUser } from '../decorators/currentUser.decorator';
import { Public } from '../decorators/public.decorator';

@Resolver()
export class SignInResolver {
  constructor(private signInService: SignInService) {}

  @Mutation(() => SignInResponse)
  @Public()
  @UseGuards(GqlLocalAuthGuard)
  async signIn(
    @Args('input') _: SignInInput,
    @CurrentUser() user: UserAuthModel,
  ): Promise<SignInResponse> {
    const signInResponse = await this.signInService.signIn(user);

    if (!signInResponse) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return signInResponse;
  }
}
