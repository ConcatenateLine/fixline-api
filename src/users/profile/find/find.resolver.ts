import { Args, Query, Resolver } from '@nestjs/graphql';
import { FindService } from './find.service';
import { FindInput } from './find.input';
import { FindResponse } from './find.response';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { UserAuthModel } from 'src/auth/models/userAuth.model';

@Resolver()
export class FindResolver {
  constructor(private findService: FindService) {}

  @Query(() => FindResponse)
  async findProfile(
    @Args('input') input: FindInput,
    @CurrentUser() user: UserAuthModel,
  ): Promise<FindResponse | null> {
    return this.findService.findProfile(input);
  }
}
