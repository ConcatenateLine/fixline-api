import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterService } from 'src/auth/register/register.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterInput } from 'src/auth/register/register.input';
import { prismaMock } from 'test/singleton';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('RegisterService', () => {
  let service: RegisterService;

  const mockRegisterInput: RegisterInput = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'SecurePassword123!',
  };

  const mockCreatedUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<RegisterService>(RegisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashedPassword123';
      
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockCreatedUser);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await service.register(mockRegisterInput);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: mockRegisterInput.email,
        },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterInput.password, 12);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: mockRegisterInput.email,
          password: hashedPassword,
          name: mockRegisterInput.name,
        },
      });

      expect(result).toEqual({
        id: mockCreatedUser.id,
        name: mockCreatedUser.name,
        email: mockCreatedUser.email,
        isActive: mockCreatedUser.isActive,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      });

      // Ensure password is not returned
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = {
        id: 1,
        email: mockRegisterInput.email,
        name: 'Existing User',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findFirst.mockResolvedValue(existingUser);

      await expect(service.register(mockRegisterInput)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(mockRegisterInput)).rejects.toThrow(
        'Email already exists',
      );

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: mockRegisterInput.email,
        },
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('should hash password with correct salt rounds', async () => {
      const hashedPassword = 'hashedPassword123';
      
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockCreatedUser);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      await service.register(mockRegisterInput);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterInput.password, 12);
    });

    it('should handle bcrypt hashing errors', async () => {
      const bcryptError = new Error('Hashing failed');
      
      prismaMock.user.findFirst.mockResolvedValue(null);
      mockedBcrypt.hash.mockImplementation(() => Promise.reject(bcryptError));

      await expect(service.register(mockRegisterInput)).rejects.toThrow(
        'Hashing failed',
      );

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('should handle database creation errors', async () => {
      const dbError = new Error('Database error');
      const hashedPassword = 'hashedPassword123';
      
      prismaMock.user.findFirst.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      prismaMock.user.create.mockRejectedValue(dbError);

      await expect(service.register(mockRegisterInput)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle database find errors', async () => {
      const dbError = new Error('Database connection error');
      
      prismaMock.user.findFirst.mockRejectedValue(dbError);

      await expect(service.register(mockRegisterInput)).rejects.toThrow(
        'Database connection error',
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('should handle empty name in input', async () => {
      const inputWithEmptyName: RegisterInput = {
        ...mockRegisterInput,
        name: '',
      };

      const userWithEmptyName = {
        ...mockCreatedUser,
        name: '',
      };

      const hashedPassword = 'hashedPassword123';
      
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(userWithEmptyName);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await service.register(inputWithEmptyName);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: inputWithEmptyName.email,
          password: hashedPassword,
          name: '',
        },
      });

      expect(result.name).toBe('');
    });
  });
});
