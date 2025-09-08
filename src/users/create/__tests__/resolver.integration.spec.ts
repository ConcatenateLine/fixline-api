import { Test, TestingModule } from '@nestjs/testing';
import { CreateResolver } from 'src/users/create/create.resolver';
import { CreateService } from 'src/users/create/create.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { prismaMock } from 'test/singleton';

describe('CreateResolver Integration', () => {
  let resolver: CreateResolver;
  let service: CreateService;

  const email = 'test@example.com';
  const name = 'Test User';
  const password = 'SecurePass123!';
  const mockUser = {
    id: 1,
    email,
    name,
    isActive: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      ...mockUser,
      password: 'hashed_password',
      updatedAt: new Date(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateResolver,
        CreateService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    resolver = module.get<CreateResolver>(CreateResolver);
    service = module.get<CreateService>(CreateService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should successfully create a new user', async () => {
      const result = await resolver.createUser({ email, name, password });

      expect(result).toMatchObject({
        id: expect.any(Number),
        email,
        name,
        isActive: true,
      });
      expect(result).toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('password');
    });

    it('should call service with correct parameters', async () => {
      const createSpy = jest.spyOn(service, 'createUser');

      await resolver.createUser({ email, name, password });

      expect(createSpy).toHaveBeenCalledWith({
        email,
        name,
        password: expect.any(String),
      });
    });

    it('should throw BadRequestException when service throws', async () => {
      const error = new BadRequestException('Email already exists');
      jest.spyOn(service, 'createUser').mockRejectedValueOnce(error);

      await expect(
        resolver.createUser({ email, name, password }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not return password in the response', async () => {
      const result = await resolver.createUser({ email, name, password });

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('hashedPassword');
    });
  });
});
