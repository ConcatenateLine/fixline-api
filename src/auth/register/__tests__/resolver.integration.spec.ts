import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { RegisterResolver } from 'src/auth/register/register.resolver';
import { RegisterService } from 'src/auth/register/register.service';
import { RegisterInput } from 'src/auth/register/register.input';
import { RegisterResponse } from 'src/auth/register/register.response';

describe('RegisterResolver', () => {
  let resolver: RegisterResolver;
  let registerService: RegisterService;

  const mockRegisterService = {
    register: jest.fn(),
  };

  const mockRegisterInput: RegisterInput = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  const mockServiceResponse = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const expectedResolverResponse: RegisterResponse = {
    message: 'User registered successfully',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterResolver,
        {
          provide: RegisterService,
          useValue: mockRegisterService,
        },
      ],
    }).compile();

    resolver = module.get<RegisterResolver>(RegisterResolver);
    registerService = module.get<RegisterService>(RegisterService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      mockRegisterService.register.mockResolvedValue(mockServiceResponse);

      const result = await resolver.register(mockRegisterInput);

      expect(registerService.register).toHaveBeenCalledWith(mockRegisterInput);
      expect(result).toEqual(expectedResolverResponse);
    });

    it('should throw UnauthorizedException when register returns null', async () => {
      mockRegisterService.register.mockResolvedValue(null);

      await expect(resolver.register(mockRegisterInput))
        .rejects.toThrow(UnauthorizedException);
      await expect(resolver.register(mockRegisterInput))
        .rejects.toThrow('Invalid credentials');

      expect(registerService.register).toHaveBeenCalledWith(mockRegisterInput);
    });

    it('should throw UnauthorizedException when register returns undefined', async () => {
      mockRegisterService.register.mockResolvedValue(undefined);

      await expect(resolver.register(mockRegisterInput))
        .rejects.toThrow(UnauthorizedException);

      expect(registerService.register).toHaveBeenCalledWith(mockRegisterInput);
    });

    it('should handle register service errors', async () => {
      const serviceError = new Error('Service error');
      mockRegisterService.register.mockRejectedValue(serviceError);

      await expect(resolver.register(mockRegisterInput))
        .rejects.toThrow('Service error');

      expect(registerService.register).toHaveBeenCalledWith(mockRegisterInput);
    });

    it('should work with different user inputs', async () => {
      const differentInput: RegisterInput = {
        name: 'Another User',
        email: 'another@example.com',
        password: 'different-password',
      };

      const differentServiceResponse = {
        ...mockServiceResponse,
        id: 2,
        name: 'Another User',
        email: 'another@example.com',
      };

      mockRegisterService.register.mockResolvedValue(differentServiceResponse);

      const result = await resolver.register(differentInput);

      expect(registerService.register).toHaveBeenCalledWith(differentInput);
      expect(result).toEqual(expectedResolverResponse);
    });

    it('should handle empty name input', async () => {
      const inputWithEmptyName: RegisterInput = {
        name: '',
        email: 'empty-name@example.com',
        password: 'password123',
      };

      const serviceResponseEmptyName = {
        ...mockServiceResponse,
        name: '',
        email: 'empty-name@example.com',
      };

      mockRegisterService.register.mockResolvedValue(serviceResponseEmptyName);

      const result = await resolver.register(inputWithEmptyName);

      expect(registerService.register).toHaveBeenCalledWith(inputWithEmptyName);
      expect(result).toEqual(expectedResolverResponse);
    });

    it('should handle long passwords', async () => {
      const inputWithLongPassword: RegisterInput = {
        name: 'Long Password User',
        email: 'long-password@example.com',
        password: 'A'.repeat(100),
      };

      mockRegisterService.register.mockResolvedValue(mockServiceResponse);

      const result = await resolver.register(inputWithLongPassword);

      expect(registerService.register).toHaveBeenCalledWith(inputWithLongPassword);
      expect(result).toEqual(expectedResolverResponse);
    });

    it('should handle special characters in email', async () => {
      const inputWithSpecialEmail: RegisterInput = {
        name: 'Special Email User',
        email: 'user+tag@example.co.uk',
        password: 'password123',
      };

      mockRegisterService.register.mockResolvedValue({
        ...mockServiceResponse,
        email: 'user+tag@example.co.uk',
      });

      const result = await resolver.register(inputWithSpecialEmail);

      expect(registerService.register).toHaveBeenCalledWith(inputWithSpecialEmail);
      expect(result).toEqual(expectedResolverResponse);
    });

    it('should return consistent success message', async () => {
      mockRegisterService.register.mockResolvedValue(mockServiceResponse);

      const result1 = await resolver.register(mockRegisterInput);
      const result2 = await resolver.register({
        ...mockRegisterInput,
        email: 'different@example.com',
      });

      expect(result1.message).toBe('User registered successfully');
      expect(result2.message).toBe('User registered successfully');
      expect(result1).toEqual(result2);
    });

    it('should handle concurrent registration requests', async () => {
      mockRegisterService.register.mockResolvedValue(mockServiceResponse);

      const promises = [
        resolver.register({
          ...mockRegisterInput,
          email: 'user1@example.com',
        }),
        resolver.register({
          ...mockRegisterInput,
          email: 'user2@example.com',
        }),
        resolver.register({
          ...mockRegisterInput,
          email: 'user3@example.com',
        }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toEqual(expectedResolverResponse);
      });
      expect(registerService.register).toHaveBeenCalledTimes(3);
    });

    it('should pass exact input to service without modification', async () => {
      mockRegisterService.register.mockResolvedValue(mockServiceResponse);

      await resolver.register(mockRegisterInput);

      expect(registerService.register).toHaveBeenCalledWith(mockRegisterInput);
      expect(registerService.register).toHaveBeenCalledTimes(1);

      // Verify the exact object was passed
      const callArgs = mockRegisterService.register.mock.calls[0][0];
      expect(callArgs).toBe(mockRegisterInput);
    });

    it('should not modify the service response', async () => {
      mockRegisterService.register.mockResolvedValue(mockServiceResponse);

      const result = await resolver.register(mockRegisterInput);

      // The resolver should create its own response object, not modify the service response
      expect(result).not.toBe(mockServiceResponse);
      expect(result).toEqual(expectedResolverResponse);
    });
  });

  describe('constructor', () => {
    it('should inject RegisterService', () => {
      expect(resolver).toBeDefined();
      expect(registerService).toBeDefined();
    });
  });

  describe('response format', () => {
    it('should always return RegisterResponse format', async () => {
      mockRegisterService.register.mockResolvedValue(mockServiceResponse);

      const result = await resolver.register(mockRegisterInput);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(Object.keys(result)).toEqual(['message']);
    });

    it('should have consistent response structure', async () => {
      mockRegisterService.register.mockResolvedValue(mockServiceResponse);

      const result = await resolver.register(mockRegisterInput);

      expect(result).toMatchObject({
        message: expect.any(String),
      });
    });
  });
});
