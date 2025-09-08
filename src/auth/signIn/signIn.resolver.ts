import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { SignInResponse } from 'src/auth/signIn/signIn.response';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { SignInInput } from 'src/auth/signIn/signIn.input';
import { SignInService } from 'src/auth/signIn/signIn.service';
import { GqlLocalAuthGuard } from 'src/auth/guards/gqlLocalAuth.guard';
import { UserAuthModel } from 'src/auth/models/userAuth.model';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

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
