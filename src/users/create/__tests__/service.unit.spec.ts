import { Test, TestingModule } from '@nestjs/testing';
import { CreateService } from '../create.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { prismaMock } from 'test/singleton';

describe('CreateService', () => {
  let service: CreateService;
  const email = 'test@example.com';
  const name = 'Test User';
  const password = 'SecurePass123!';

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      email,
      name,
      password,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CreateService>(CreateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const result = await service.createUser({ email, name, password });

      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            email,
            name,
            password: expect.stringMatching(/^\$2[aby]\$.{56}$/),
          },
        }),
      );
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', email);
      expect(result).toHaveProperty('name', name);
    });

    it('should throw BadRequestException if email already exists', async () => {
      const prismaError = new Error('Unique constraint failed');
      prismaMock.user.create.mockRejectedValueOnce(prismaError);

      await expect(
        service.createUser({ email, name, password }),
      ).rejects.toThrow('Unique constraint failed');
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      prismaMock.user.create.mockRejectedValueOnce(dbError);

      await expect(
        service.createUser({ email, name, password }),
      ).rejects.toThrow('Database error');
    });
  });
});
