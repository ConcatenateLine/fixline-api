import { Query, Resolver } from "@nestjs/graphql";

@Resolver(() => String)
export class GrapqlResolver {
  @Query(() => String)
  hello(): string {
    return 'Hello from FixLine!';
  }
}
