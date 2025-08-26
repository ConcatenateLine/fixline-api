import { Mutation, Resolver } from "@nestjs/graphql";
import { CreateService } from "./create.service";
import { Args } from "@nestjs/graphql";
import { UserModel } from "../models/user.model";
import { CreateUserInput } from "./create.input";

@Resolver(() => UserModel)
export class CreateResolver {
    constructor(private readonly createService: CreateService) { }

    @Mutation(() => UserModel)
    createUser(@Args('data') data: CreateUserInput): Promise<UserModel> {
        return this.createService.createUser(data);
    }
}
