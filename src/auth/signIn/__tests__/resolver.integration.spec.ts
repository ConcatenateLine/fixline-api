import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { SignInResolver } from '../signIn.resolver';
import { SignInService } from '../signIn.service';
import { SignInInput } from '../signIn.input';
import { SignInResponse } from '../signIn.response';
import { UserAuthModel } from '../../models/userAuth.model';

describe('SignInResolver', () => {
  let resolver: SignInResolver;
  let signInService: SignInService;

  const mockSignInService = {
    signIn: jest.fn(),
  };

  const mockUser: UserAuthModel = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    memberships: ['tenant1'],
  };

  const mockSignInInput: SignInInput = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockSignInResponse: SignInResponse = {
    access_token: 'jwt-token-123',
    user: mockUser,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInResolver,
        {
          provide: SignInService,
          useValue: mockSignInService,
        },
      ],
    }).compile();

    resolver = module.get<SignInResolver>(SignInResolver);
    signInService = module.get<SignInService>(SignInService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      mockSignInService.signIn.mockResolvedValue(mockSignInResponse);

      const result = await resolver.signIn(mockSignInInput, mockUser);

      expect(signInService.signIn).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockSignInResponse);
    });

    it('should throw UnauthorizedException when signIn returns null', async () => {
      mockSignInService.signIn.mockResolvedValue(null);

      await expect(resolver.signIn(mockSignInInput, mockUser))
        .rejects.toThrow(UnauthorizedException);
      await expect(resolver.signIn(mockSignInInput, mockUser))
        .rejects.toThrow('Invalid credentials');

      expect(signInService.signIn).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException when signIn returns undefined', async () => {
      mockSignInService.signIn.mockResolvedValue(undefined);

      await expect(resolver.signIn(mockSignInInput, mockUser))
        .rejects.toThrow(UnauthorizedException);

      expect(signInService.signIn).toHaveBeenCalledWith(mockUser);
    });

    it('should handle signIn service errors', async () => {
      const serviceError = new Error('Service error');
      mockSignInService.signIn.mockRejectedValue(serviceError);

      await expect(resolver.signIn(mockSignInInput, mockUser))
        .rejects.toThrow('Service error');

      expect(signInService.signIn).toHaveBeenCalledWith(mockUser);
    });

    it('should work with different user types', async () => {
      const userWithoutMemberships: UserAuthModel = {
        id: 2,
        name: 'User Two',
        email: 'user2@example.com',
      };

      const expectedResponse: SignInResponse = {
        access_token: 'jwt-token-456',
        user: userWithoutMemberships,
      };

      mockSignInService.signIn.mockResolvedValue(expectedResponse);

      const result = await resolver.signIn(mockSignInInput, userWithoutMemberships);

      expect(signInService.signIn).toHaveBeenCalledWith(userWithoutMemberships);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle user with empty memberships', async () => {
      const userWithEmptyMemberships: UserAuthModel = {
        id: 3,
        name: 'User Three',
        email: 'user3@example.com',
        memberships: [],
      };

      const expectedResponse: SignInResponse = {
        access_token: 'jwt-token-789',
        user: userWithEmptyMemberships,
      };

      mockSignInService.signIn.mockResolvedValue(expectedResponse);

      const result = await resolver.signIn(mockSignInInput, userWithEmptyMemberships);

      expect(signInService.signIn).toHaveBeenCalledWith(userWithEmptyMemberships);
      expect(result).toEqual(expectedResponse);
    });

    it('should pass through the user from CurrentUser decorator', async () => {
      mockSignInService.signIn.mockResolvedValue(mockSignInResponse);

      await resolver.signIn(mockSignInInput, mockUser);

      // Verify that the resolver uses the user from the decorator, not from the input
      expect(signInService.signIn).toHaveBeenCalledWith(mockUser);
      expect(signInService.signIn).toHaveBeenCalledTimes(1);
    });

    it('should ignore the input parameter for authentication', async () => {
      // The input is only used for validation by the guard, not by the resolver
      const differentInput: SignInInput = {
        email: 'different@example.com',
        password: 'different-password',
      };

      mockSignInService.signIn.mockResolvedValue(mockSignInResponse);

      const result = await resolver.signIn(differentInput, mockUser);

      // The resolver should still use the authenticated user, not the input
      expect(signInService.signIn).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockSignInResponse);
    });

    it('should return the exact response from signInService', async () => {
      const customResponse: SignInResponse = {
        access_token: 'custom-jwt-token',
        user: {
          id: 999,
          name: 'Custom User',
          email: 'custom@example.com',
          memberships: ['tenant1', 'tenant2'],
        },
      };

      mockSignInService.signIn.mockResolvedValue(customResponse);

      const result = await resolver.signIn(mockSignInInput, mockUser);

      expect(result).toBe(customResponse);
      expect(result).toEqual(customResponse);
    });

    it('should handle concurrent sign-in requests', async () => {
      mockSignInService.signIn.mockResolvedValue(mockSignInResponse);

      const promises = [
        resolver.signIn(mockSignInInput, mockUser),
        resolver.signIn(mockSignInInput, mockUser),
        resolver.signIn(mockSignInInput, mockUser),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toEqual(mockSignInResponse);
      });
      expect(signInService.signIn).toHaveBeenCalledTimes(3);
    });
  });

  describe('constructor', () => {
    it('should inject SignInService', () => {
      expect(resolver).toBeDefined();
      expect(signInService).toBeDefined();
    });
  });
});
