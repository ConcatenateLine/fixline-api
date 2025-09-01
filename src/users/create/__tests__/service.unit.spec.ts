import { Test, TestingModule } from '@nestjs/testing';
import { CreateService } from '../create.service';
import { PrismaService } from 'src/prisma/prisma.service';

const mockPrisma = {
  user: {
    create: jest.fn(),
  },
};

describe('CreateService', () => {
  let service: CreateService;
  const email = 'test@example.com';
  const name = 'test';
  const password = 'test';

  beforeEach(async () => {
    jest.clearAllMocks();

    mockPrisma.user.create.mockResolvedValue({ id: 1, email, name });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CreateService>(CreateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user and return result', async () => {
    const result = await service.createUser({ email, name, password });
    expect(result).toEqual({ id: 1, email, name });
  });

  it('should call Prisma with correct user data', async () => {
    await service.createUser({ email, name, password });
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { email, name } }),
    );
  });

  it('should hash password before saving', async () => {
    await service.createUser({ email, name, password });
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          password: expect.stringMatching(/^\$2[aby]\$.{56}$/),
        },
      }),
    );
  });

  it('should throw if Prisma create fails', async () => {
    mockPrisma.user.create.mockRejectedValue(new Error('DB error'));
    await expect(service.createUser({ email, name, password })).rejects.toThrow(
      'DB error',
    );
  });
});
