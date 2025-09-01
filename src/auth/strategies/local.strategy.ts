import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidateService } from '../validate/validate.service';
import { UserAuthModel } from '../models/userAuth.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private validateService: ValidateService) {
    super({ usernameField: 'email' });
  }

  async validate(username: string, password: string): Promise<UserAuthModel> {
    const user = await this.validateService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
