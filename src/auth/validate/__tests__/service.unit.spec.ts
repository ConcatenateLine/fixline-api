import { Test, TestingModule } from '@nestjs/testing';
import { ValidateService } from '../validate.service';
import { FindService } from 'src/users/find/find.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('ValidateService', () => {
  let service: ValidateService;
  let findService: FindService;

  const mockFindService = {
    findUserByEmail: jest.fn(),
  };

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$12$hashedPassword',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateService,
        {
          provide: FindService,
          useValue: mockFindService,
        },
      ],
    }).compile();

    service = module.get<ValidateService>(ValidateService);
    findService = module.get<FindService>(FindService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'SecurePassword123!';

    it('should return user when credentials are valid', async () => {
      mockFindService.findUserByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockFindService.findUserByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when user has no password', async () => {
      const userWithoutPassword = {
        ...mockUser,
        password: null,
      };
      mockFindService.findUserByEmail.mockResolvedValue(userWithoutPassword);

      const result = await service.validateUser(email, password);

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when user has empty password', async () => {
      const userWithEmptyPassword = {
        ...mockUser,
        password: '',
      };
      mockFindService.findUserByEmail.mockResolvedValue(userWithEmptyPassword);

      const result = await service.validateUser(email, password);

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      mockFindService.findUserByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser(email, password);

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toBeNull();
    });

    it('should handle findService errors', async () => {
      const findError = new Error('Database error');
      mockFindService.findUserByEmail.mockRejectedValue(findError);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        'Database error',
      );

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should handle bcrypt comparison errors', async () => {
      const bcryptError = new Error('Bcrypt error');
      mockFindService.findUserByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockImplementation(() => Promise.reject(bcryptError));

      await expect(service.validateUser(email, password)).rejects.toThrow(
        'Bcrypt error',
      );

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should handle empty email', async () => {
      const emptyEmail = '';
      mockFindService.findUserByEmail.mockResolvedValue(null);
      
      const result = await service.validateUser(emptyEmail, password);

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ 
        email: emptyEmail 
      });
      expect(result).toBeNull();
    });

    it('should handle empty password', async () => {
      const emptyPassword = '';
      mockFindService.findUserByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser(email, emptyPassword);

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(emptyPassword, mockUser.password);
      expect(result).toBeNull();
    });

    it('should handle special characters in email', async () => {
      const specialEmail = 'test+tag@example.com';
      mockFindService.findUserByEmail.mockResolvedValue({
        ...mockUser,
        email: specialEmail,
      });
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser(specialEmail, password);

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ 
        email: specialEmail 
      });
      expect(result).toBeTruthy();
    });

    it('should be case sensitive for email', async () => {
      const upperCaseEmail = 'TEST@EXAMPLE.COM';
      mockFindService.findUserByEmail.mockResolvedValue(null);

      const result = await service.validateUser(upperCaseEmail, password);

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ 
        email: upperCaseEmail 
      });
      expect(result).toBeNull();
    });

    it('should handle undefined password field in user', async () => {
      const userWithUndefinedPassword = {
        ...mockUser,
        password: undefined,
      };
      mockFindService.findUserByEmail.mockResolvedValue(userWithUndefinedPassword);

      const result = await service.validateUser(email, password);

      expect(findService.findUserByEmail).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
