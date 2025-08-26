import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateService } from '../create.service';

const mockPrisma = {
    user: {
        create: jest.fn(),
    },
};

describe('Create user service', () => {
    let service: CreateService;
    const email = 'test@example.com';
    const name = 'test';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CreateService, { provide: PrismaService, useValue: mockPrisma }],
        }).compile();

        service = module.get<CreateService>(CreateService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create user', async () => {
        const result = await service.createUser({ email, name });
        expect(result).toBeDefined();
    });

    it('should create user', async () => {
        await service.createUser({ email, name });
        expect(mockPrisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
            email,
            name,
        }));
    });

    // it('should hash password before saving', async () => {
    //     const result = await service.createUser({ email, password });
    //     expect(mockPrisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
    //       password: expect.stringMatching(/^\$2[aby]\$.{56}$/)
    //     }));
    //   });
});

