import { Mutation, Resolver } from "@nestjs/graphql";
import { CreateService } from "./create.service";
import { Args } from "@nestjs/graphql";
import { CreateUserInput } from "./create.input";
import { UserModel } from "../models/user.model";
import { CreateResponse } from "./create.response";

@Resolver(() => UserModel)
export class CreateResolver {
  constructor(private readonly createService: CreateService) { }

  @Mutation(() => CreateResponse)
  async createUser(@Args('data') data: CreateUserInput): Promise<CreateResponse> {
    const user = await this.createService.createUser(data);

    if (!user) {
      throw new Error('User not created');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      memberships: []
    };
  }
}
