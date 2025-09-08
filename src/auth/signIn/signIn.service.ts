import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAuthModel } from 'src/auth/models/userAuth.model';

@Injectable()
export class SignInService {
  constructor(private jwtService: JwtService) {}

  async signIn(user: UserAuthModel) {
    const payload = {
      sub: user.id,
      email: user.email,
      memberships: user.memberships,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
