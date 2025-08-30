import { Injectable } from '@nestjs/common';

@Injectable()
export class SignInService {
  constructor(
  ) { }

  async signIn(user: any) {
    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      roles: user.roles,
    };
    return user;
    // return {
    //   access_token: this.jwtService.sign(payload),
    // };
  }
}
