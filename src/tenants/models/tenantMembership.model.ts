import { Field, ObjectType } from '@nestjs/graphql';
import Role from 'src/common/enums/role.enum';
import { UserModel } from 'src/users/models/user.model';
import { TenantModel } from './tenant.model';

@ObjectType()
export class TenantMembershipModel {
  @Field()
  id: string;

  @Field()
  tenantId: string;

  @Field()
  userId: number;

  @Field()
  role: Role;

  @Field()
  joinedAt: Date;

  @Field(() => TenantModel)
  tenant: TenantModel;

  @Field(() => UserModel)
  user: UserModel;
}
