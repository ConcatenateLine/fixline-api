import { Injectable } from '@nestjs/common';
import { FindService } from 'src/users/find/find.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ValidateService {
  constructor(private findService: FindService) {}

  async validateUser(email: string, password: string) {
    const user = await this.findService.findUserByEmail({
      email,
    });
    if (!user || !user.password) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }
}
