import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { RegisterResponse } from 'src/auth/register/register.response';
import { RegisterInput } from 'src/auth/register/register.input';
import { RegisterService } from 'src/auth/register/register.service';
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
