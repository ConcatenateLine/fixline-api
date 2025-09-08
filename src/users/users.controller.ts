import { Controller, Get } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll(): Promise<UserModel[]> {
        return this.usersService.users({});
    }
}
