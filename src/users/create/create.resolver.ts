import { Mutation, Resolver } from '@nestjs/graphql';
import { CreateService } from 'src/users/create/create.service';
import { Args } from '@nestjs/graphql';
import { CreateUserInput } from 'src/users/create/create.input';
import { UserModel } from 'src/users/models/user.model';
import { CreateResponse } from 'src/users/create/create.response';
import { ConflictException } from '@nestjs/common';

@Resolver(() => UserModel)
export class CreateResolver {
  constructor(private readonly createService: CreateService) {}

  @Mutation(() => CreateResponse)
  async createUser(
    @Args('input') input: CreateUserInput,
  ): Promise<CreateResponse> {
    try {
      const user = await this.createService.createUser(input);

      if (!user) {
        throw new Error('User not created');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
        throw new ConflictException('User with this email already exists');
      }

      throw error;
    }
  }
}
