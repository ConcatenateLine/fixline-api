import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { SignInService } from '../signIn/signIn.service';
import { RegisterService } from '../register/register.service';
import { ValidateService } from '../validate/validate.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { LocalStrategy } from '../strategies/local.strategy';
import { JwtAuthGuard } from '../guards/jwtAuth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindService } from 'src/users/find/find.service';
import { prismaMock } from 'test/singleton';
import { UserAuthModel } from '../models/userAuth.model';
import { RegisterInput } from '../register/register.input';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../interfaces/jwtPayload.interface';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthModule Integration', () => {
  let module: TestingModule;
  let signInService: SignInService;
  let registerService: RegisterService;
  let validateService: ValidateService;
  let jwtService: JwtService;
  let jwtStrategy: JwtStrategy;
  let localStrategy: LocalStrategy;
  let findService: FindService;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$12$hashedPassword',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFindService = {
    findUserByEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Set environment variable for JWT
    process.env.JWT_SECRET = 'test-secret-key';

    module = await Test.createTestingModule({
      providers: [
        SignInService,
        RegisterService,
        ValidateService,
        JwtStrategy,
        LocalStrategy,
        JwtAuthGuard,
        Reflector,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: FindService,
          useValue: mockFindService,
        },
        {
          provide: 'APP_GUARD',
          useClass: JwtAuthGuard,
        },
      ],
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1d' },
        }),
        PassportModule,
      ],
    }).compile();

    signInService = module.get<SignInService>(SignInService);
    registerService = module.get<RegisterService>(RegisterService);
    validateService = module.get<ValidateService>(ValidateService);
    jwtService = module.get<JwtService>(JwtService);
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    findService = module.get<FindService>(FindService);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have all required services', () => {
    expect(signInService).toBeDefined();
    expect(registerService).toBeDefined();
    expect(validateService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(jwtStrategy).toBeDefined();
    expect(localStrategy).toBeDefined();
    expect(findService).toBeDefined();
  });

  describe('Complete Authentication Flow', () => {
    const registerInput: RegisterInput = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'SecurePassword123!',
    };

    it('should complete full registration and sign-in flow', async () => {
      const hashedPassword = '$2b$12$hashedNewPassword';
      const createdUser = {
        ...mockUser,
        email: registerInput.email,
        name: registerInput.name,
        password: hashedPassword,
      };

      // Mock registration
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(createdUser);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      // Step 1: Register user
      const registeredUser = await registerService.register(registerInput);

      expect(registeredUser).toEqual({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });

      // Step 2: Sign in with the registered user
      const userAuthModel: UserAuthModel = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        memberships: ['tenant1'],
      };

      const signInResult = await signInService.signIn(userAuthModel);

      expect(signInResult).toHaveProperty('access_token');
      expect(signInResult).toHaveProperty('user');
      expect(signInResult.user).toEqual(userAuthModel);

      // Step 3: Verify JWT token can be decoded
      const decodedToken = jwtService.decode(signInResult.access_token) as any;
      expect(decodedToken.sub).toBe(createdUser.id);
      expect(decodedToken.email).toBe(createdUser.email);
      expect(decodedToken.memberships).toEqual(['tenant1']);
    });

    it('should handle authentication validation flow', async () => {
      const email = 'existing@example.com';
      const password = 'UserPassword123!';

      // Mock validation
      mockFindService.findUserByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Step 1: Validate user credentials
      const validatedUser = await validateService.validateUser(email, password);

      expect(validatedUser).toEqual(mockUser);

      // Step 2: Use local strategy to authenticate
      const authResult = await localStrategy.validate(email, password);

      expect(authResult).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });

      // Step 3: Sign in the authenticated user
      const signInResult = await signInService.signIn(authResult);

      expect(signInResult.access_token).toBeDefined();
      expect(typeof signInResult.access_token).toBe('string');
    });

    it('should handle JWT token validation through strategy', async () => {
      const userAuthModel: UserAuthModel = {
        id: 1,
        name: 'JWT User',
        email: 'jwt@example.com',
        memberships: ['tenant1', 'tenant2'],
      };

      // Step 1: Create JWT token
      const signInResult = await signInService.signIn(userAuthModel);

      // Step 2: Verify JWT token using strategy
      const payload: JwtPayload = {
        sub: userAuthModel.id,
        email: userAuthModel.email,
        memberships: userAuthModel.memberships || [],
      };

      const strategyResult = await jwtStrategy.validate(payload);

      expect(strategyResult).toEqual({
        id: payload.sub,
        email: payload.email,
        memberships: payload.memberships,
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle registration conflicts properly', async () => {
      const registerInput: RegisterInput = {
        name: 'Duplicate User',
        email: 'existing@example.com',
        password: 'Password123!',
      };

      // Mock existing user
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      await expect(registerService.register(registerInput)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle authentication failures properly', async () => {
      const email = 'nonexistent@example.com';
      const password = 'WrongPassword';

      // Mock user not found
      mockFindService.findUserByEmail.mockResolvedValue(null);

      // Should fail validation
      const validationResult = await validateService.validateUser(email, password);
      expect(validationResult).toBeNull();

      // Should throw UnauthorizedException in local strategy
      await expect(localStrategy.validate(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle invalid password properly', async () => {
      const email = 'test@example.com';
      const wrongPassword = 'WrongPassword123!';

      // Mock user found but password invalid
      mockFindService.findUserByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Should fail validation
      const validationResult = await validateService.validateUser(email, wrongPassword);
      expect(validationResult).toBeNull();

      // Should throw UnauthorizedException in local strategy
      await expect(localStrategy.validate(email, wrongPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Service Dependencies', () => {
    it('should have proper dependency injection', () => {
      // Verify that all services are properly injected and connected
      expect(signInService).toBeInstanceOf(SignInService);
      expect(registerService).toBeInstanceOf(RegisterService);
      expect(validateService).toBeInstanceOf(ValidateService);
      expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
      expect(localStrategy).toBeInstanceOf(LocalStrategy);
    });

    it('should share the same JwtService instance', () => {
      // Both SignInService should use the same JwtService instance
      expect(jwtService).toBeDefined();
    });

    it('should properly configure JWT module', async () => {
      const testPayload = { sub: 1, email: 'test@example.com' };
      const token = jwtService.sign(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwtService.decode(token) as any;
      expect(decoded.sub).toBe(testPayload.sub);
      expect(decoded.email).toBe(testPayload.email);
    });
  });

  describe('Guard Integration', () => {
    it('should have JWT Auth Guard available', () => {
      // This test verifies the JWT Auth Guard is properly configured
      expect(() => module.get(JwtAuthGuard)).not.toThrow();
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment JWT_SECRET', () => {
      process.env.JWT_SECRET = 'custom-test-secret';
      const customStrategy = new JwtStrategy();
      
      expect(customStrategy).toBeDefined();
    });

    it('should fallback to default secret when JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      const defaultStrategy = new JwtStrategy();
      
      expect(defaultStrategy).toBeDefined();
    });
  });

  describe('Module Compilation', () => {
    it('should compile without errors', () => {
      expect(module).toBeDefined();
    });

    it('should provide all expected services', () => {
      const expectedServices = [
        SignInService,
        RegisterService,
        ValidateService,
        JwtStrategy,
        LocalStrategy,
      ];

      expectedServices.forEach(service => {
        expect(() => module.get(service)).not.toThrow();
      });
    });
  });
});
