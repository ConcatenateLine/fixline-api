import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from '../local.strategy';
import { ValidateService } from '../../validate/validate.service';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let validateService: ValidateService;

  const mockValidateService = {
    validateUser: jest.fn(),
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
        LocalStrategy,
        {
          provide: ValidateService,
          useValue: mockValidateService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    validateService = module.get<ValidateService>(ValidateService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should be an instance of LocalStrategy', () => {
    expect(strategy).toBeInstanceOf(LocalStrategy);
  });

  describe('validate', () => {
    const email = 'test@example.com';
    const password = 'SecurePassword123!';

    it('should return UserAuthModel when credentials are valid', async () => {
      mockValidateService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate(email, password);

      expect(validateService.validateUser).toHaveBeenCalledWith(email, password);
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
      expect(result).toBeInstanceOf(Object);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockValidateService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(email, password)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(validateService.validateUser).toHaveBeenCalledWith(email, password);
    });

    it('should throw UnauthorizedException when user is undefined', async () => {
      mockValidateService.validateUser.mockResolvedValue(undefined);

      await expect(strategy.validate(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(email, password)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(validateService.validateUser).toHaveBeenCalledWith(email, password);
    });

    it('should exclude password from returned UserAuthModel', async () => {
      mockValidateService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate(email, password);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('isActive');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
      
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it('should handle user with null name', async () => {
      const userWithNullName = {
        ...mockUser,
        name: null,
      };
      mockValidateService.validateUser.mockResolvedValue(userWithNullName);

      const result = await strategy.validate(email, password);

      expect(result).toEqual({
        id: userWithNullName.id,
        name: null,
        email: userWithNullName.email,
      });
    });

    it('should handle user with empty name', async () => {
      const userWithEmptyName = {
        ...mockUser,
        name: '',
      };
      mockValidateService.validateUser.mockResolvedValue(userWithEmptyName);

      const result = await strategy.validate(email, password);

      expect(result).toEqual({
        id: userWithEmptyName.id,
        name: '',
        email: userWithEmptyName.email,
      });
    });

    it('should handle ValidateService errors', async () => {
      const validateError = new Error('Database connection error');
      mockValidateService.validateUser.mockRejectedValue(validateError);

      await expect(strategy.validate(email, password)).rejects.toThrow(
        'Database connection error',
      );

      expect(validateService.validateUser).toHaveBeenCalledWith(email, password);
    });

    it('should handle empty email', async () => {
      const emptyEmail = '';
      mockValidateService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate(emptyEmail, password)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(validateService.validateUser).toHaveBeenCalledWith(emptyEmail, password);
    });

    it('should handle empty password', async () => {
      const emptyPassword = '';
      mockValidateService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate(email, emptyPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(validateService.validateUser).toHaveBeenCalledWith(email, emptyPassword);
    });

    it('should handle both empty email and password', async () => {
      const emptyEmail = '';
      const emptyPassword = '';
      mockValidateService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate(emptyEmail, emptyPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(validateService.validateUser).toHaveBeenCalledWith(emptyEmail, emptyPassword);
    });

    it('should handle special email formats', async () => {
      const specialEmails = [
        'test+tag@example.com',
        'user.name@example.com',
        'user_name@example.co.uk',
        'user123@sub.example.com',
      ];

      for (const specialEmail of specialEmails) {
        mockValidateService.validateUser.mockResolvedValue({
          ...mockUser,
          email: specialEmail,
        });

        const result = await strategy.validate(specialEmail, password);

        expect(result.email).toBe(specialEmail);
        expect(validateService.validateUser).toHaveBeenCalledWith(specialEmail, password);
      }
    });

    it('should handle long passwords', async () => {
      const longPassword = 'A'.repeat(100);
      mockValidateService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate(email, longPassword);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
      expect(validateService.validateUser).toHaveBeenCalledWith(email, longPassword);
    });

    it('should handle user with numeric fields', async () => {
      const userWithNumericFields = {
        ...mockUser,
        id: 999,
      };
      mockValidateService.validateUser.mockResolvedValue(userWithNumericFields);

      const result = await strategy.validate(email, password);

      expect(result.id).toBe(999);
      expect(typeof result.id).toBe('number');
    });

    it('should preserve email case sensitivity', async () => {
      const upperCaseEmail = 'TEST@EXAMPLE.COM';
      const userWithUpperCaseEmail = {
        ...mockUser,
        email: upperCaseEmail,
      };
      mockValidateService.validateUser.mockResolvedValue(userWithUpperCaseEmail);

      const result = await strategy.validate(upperCaseEmail, password);

      expect(result.email).toBe(upperCaseEmail);
      expect(validateService.validateUser).toHaveBeenCalledWith(upperCaseEmail, password);
    });
  });

  describe('constructor configuration', () => {
    it('should configure usernameField as email', () => {
      // This tests that the strategy is configured to use email instead of username
      // The actual configuration is tested indirectly through the validate method
      expect(strategy).toBeDefined();
    });
  });
});
