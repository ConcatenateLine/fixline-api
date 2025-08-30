import { Injectable } from '@nestjs/common';
import { FindService } from 'src/users/find/find.service';

@Injectable()
export class ValidateService {
  constructor(
    private findService: FindService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.findService.findUserByEmail({
      email
    });
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
}
