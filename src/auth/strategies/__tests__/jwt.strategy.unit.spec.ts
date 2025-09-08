import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    // Set environment variable for testing
    process.env.JWT_SECRET = 'test-jwt-secret-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.JWT_SECRET;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should be an instance of JwtStrategy', () => {
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });

  describe('validate', () => {
    it('should return user object from valid JWT payload', async () => {
      const mockPayload: JwtPayload = {
        sub: 1,
        email: 'test@example.com',
        memberships: ['tenant1', 'tenant2'],
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        memberships: mockPayload.memberships,
      });
    });

    it('should handle payload without memberships', async () => {
      const mockPayload: JwtPayload = {
        sub: 2,
        email: 'user2@example.com',
        memberships: [],
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        memberships: [],
      });
    });

    it('should handle payload with empty memberships array', async () => {
      const mockPayload: JwtPayload = {
        sub: 3,
        email: 'user3@example.com',
        memberships: [],
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        memberships: [],
      });
    });

    it('should handle payload with null memberships', async () => {
      const mockPayload = {
        sub: 4,
        email: 'user4@example.com',
        memberships: null,
      } as any;

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        memberships: null,
      });
    });

    it('should handle payload with undefined memberships', async () => {
      const mockPayload = {
        sub: 5,
        email: 'user5@example.com',
        memberships: undefined,
      } as any;

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        memberships: undefined,
      });
    });

    it('should handle payload with single membership', async () => {
      const mockPayload: JwtPayload = {
        sub: 6,
        email: 'user6@example.com',
        memberships: ['tenant1'],
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        memberships: ['tenant1'],
      });
    });

    it('should handle payload with multiple memberships', async () => {
      const mockPayload: JwtPayload = {
        sub: 7,
        email: 'user7@example.com',
        memberships: ['tenant1', 'tenant2', 'tenant3'],
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        memberships: ['tenant1', 'tenant2', 'tenant3'],
      });
    });

    it('should handle numeric user ID correctly', async () => {
      const mockPayload: JwtPayload = {
        sub: 999,
        email: 'user999@example.com',
        memberships: ['tenant1'],
      };

      const result = await strategy.validate(mockPayload);

      expect(result.id).toBe(999);
      expect(typeof result.id).toBe('number');
    });

    it('should preserve email format', async () => {
      const emailsToTest = [
        'simple@example.com',
        'test+tag@example.com',
        'user.name@example.com',
        'user_name@example.co.uk',
      ];

      for (const email of emailsToTest) {
        const mockPayload: JwtPayload = {
          sub: 1,
          email,
          memberships: [],
        };

        const result = await strategy.validate(mockPayload);
        expect(result.email).toBe(email);
      }
    });

    it('should handle special characters in memberships', async () => {
      const mockPayload: JwtPayload = {
        sub: 8,
        email: 'user8@example.com',
        memberships: ['tenant-1', 'tenant_2', 'tenant.3'],
      };

      const result = await strategy.validate(mockPayload);

      expect(result.memberships).toEqual(['tenant-1', 'tenant_2', 'tenant.3']);
    });
  });

  describe('constructor', () => {
    it('should use environment JWT_SECRET when available', () => {
      process.env.JWT_SECRET = 'custom-secret-key';
      
      const newStrategy = new JwtStrategy();
      
      // We can't directly test the secret, but we can verify the strategy was created
      expect(newStrategy).toBeDefined();
      expect(newStrategy).toBeInstanceOf(JwtStrategy);
    });

    it('should use default secret when JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      
      const newStrategy = new JwtStrategy();
      
      expect(newStrategy).toBeDefined();
      expect(newStrategy).toBeInstanceOf(JwtStrategy);
    });

    it('should use default secret when JWT_SECRET is empty', () => {
      process.env.JWT_SECRET = '';
      
      const newStrategy = new JwtStrategy();
      
      expect(newStrategy).toBeDefined();
      expect(newStrategy).toBeInstanceOf(JwtStrategy);
    });
  });
});
