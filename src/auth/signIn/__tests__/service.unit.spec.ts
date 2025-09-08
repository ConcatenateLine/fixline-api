import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { SignInService } from 'src/auth/signIn/signIn.service';
import { UserAuthModel } from 'src/auth/models/userAuth.model';

describe('SignInService', () => {
  let service: SignInService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser: UserAuthModel = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    memberships: ['tenant1', 'tenant2'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<SignInService>(SignInService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should generate JWT token and return user with access token', async () => {
      const expectedToken = 'jwt-token-123';
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.signIn(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        memberships: mockUser.memberships,
      });

      expect(result).toEqual({
        access_token: expectedToken,
        user: mockUser,
      });
    });

    it('should handle user without memberships', async () => {
      const userWithoutMemberships: UserAuthModel = {
        id: 2,
        name: 'User Two',
        email: 'user2@example.com',
      };
      
      const expectedToken = 'jwt-token-456';
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.signIn(userWithoutMemberships);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userWithoutMemberships.id,
        email: userWithoutMemberships.email,
        memberships: undefined,
      });

      expect(result).toEqual({
        access_token: expectedToken,
        user: userWithoutMemberships,
      });
    });

    it('should handle empty memberships array', async () => {
      const userWithEmptyMemberships: UserAuthModel = {
        id: 3,
        name: 'User Three',
        email: 'user3@example.com',
        memberships: [],
      };
      
      const expectedToken = 'jwt-token-789';
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.signIn(userWithEmptyMemberships);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userWithEmptyMemberships.id,
        email: userWithEmptyMemberships.email,
        memberships: [],
      });

      expect(result).toEqual({
        access_token: expectedToken,
        user: userWithEmptyMemberships,
      });
    });

    it('should handle JWT service errors', async () => {
      const jwtError = new Error('JWT signing failed');
      mockJwtService.sign.mockImplementation(() => {
        throw jwtError;
      });

      await expect(service.signIn(mockUser)).rejects.toThrow('JWT signing failed');
    });
  });
});
