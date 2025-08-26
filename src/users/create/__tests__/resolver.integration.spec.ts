import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateService } from '../create.service';
import { CreateResolver } from '../create.resolver';
import { CreateUserInput } from '../create.input';

const mockPrisma = {
    user: {
        create: jest.fn(),
    },
};

describe('Create user resolver', () => {
    let resolver: CreateResolver;
    const email = 'test@example.com';
    const name = 'test';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CreateResolver, CreateService, { provide: PrismaService, useValue: mockPrisma }],
        }).compile();

        resolver = module.get<CreateResolver>(CreateResolver);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    it('should create user', async () => {
        const result = await resolver.createUser({ email, name });
        expect(result).toBeDefined();
    });

    it('should create user', async () => {
        await resolver.createUser({ email, name });
        expect(mockPrisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
            email,
            name,
        }));
    });
});
