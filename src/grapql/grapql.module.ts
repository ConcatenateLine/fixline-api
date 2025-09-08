import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GrapqlResolver } from 'src/grapql/grapql.resolver';
import { Request } from 'express';

@Module({
  providers: [GrapqlResolver],
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql', // or join(__dirname, 'schema.gql')
      playground: true,
      sortSchema: true,
      context: ({ req }: { req: Request }) => ({ req }),
    }),
  ],
})
export class GrapqlModule {}
