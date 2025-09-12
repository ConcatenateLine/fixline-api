import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CheckOutService } from 'src/users/checkOut/checkOut.service';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { GqlLocalAuthGuard } from 'src/auth/guards/gqlLocalAuth.guard';

@Resolver('CheckOut')
export class CheckOutResolver {
  constructor(private readonly checkOutService: CheckOutService) {}

  @Mutation(() => String)
  @UseGuards(GqlLocalAuthGuard)
  async createCheckoutSession(
    @CurrentUser() user: any,
    @Args('planId') planId: string,
    @Args('processor', { nullable: true, defaultValue: 'stripe' })
    processor: string,
  ) {
    const { url } = await this.checkOutService.createCheckoutSession(
      user.email,
      planId,
      processor,
    );
    return url;
  }
}
