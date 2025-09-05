import { Field, ObjectType } from '@nestjs/graphql';
import { TenantMembershipModel } from './tenantMembership.model';

@ObjectType()
export class TenantModel {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  isActive: boolean;

  @Field(() => String, { nullable: true })
  contactEmail?: string;

  @Field(() => [TenantMembershipModel], { nullable: true })
  memberships?: TenantMembershipModel[];
}
