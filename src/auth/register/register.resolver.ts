import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { RegisterResponse } from './register.response';
import { RegisterInput } from './register.input';
import { RegisterService } from './register.service';
import { UserModel } from 'src/users/models/user.model';

@Resolver(() => UserModel)
export class RegisterResolver {
  constructor(private registerService: RegisterService) {}

  @Mutation(() => RegisterResponse)
  @Public()
  async register(
    @Args('input') input: RegisterInput,
  ): Promise<RegisterResponse> {
    const registerResponse = await this.registerService.register(input);

    if (!registerResponse) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      message: 'User registered successfully',
    };
  }
}
