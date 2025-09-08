import { Field, ObjectType } from '@nestjs/graphql';
import { TenantMembershipModel } from 'src/tenants/models/tenantMembership.model';

@ObjectType()
export class UserModel {
  @Field()
  id: number;

  @Field({ nullable: true })
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [TenantMembershipModel], { nullable: true })
  memberships?: TenantMembershipModel[];
}
