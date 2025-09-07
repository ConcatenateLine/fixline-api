import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthGuard } from '../jwtAuth.guard';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

// Mock GqlExecutionContext
jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;
  let mockGqlExecutionContext: any;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    reflector = mockReflector as any;
    guard = new JwtAuthGuard(reflector);

    // Mock execution context
    const mockHandler = jest.fn();
    const mockClass = jest.fn();
    
    mockExecutionContext = {
      getHandler: jest.fn().mockReturnValue(mockHandler),
      getClass: jest.fn().mockReturnValue(mockClass),
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any;

    // Mock GraphQL execution context
    mockGqlExecutionContext = {
      getContext: jest.fn(() => ({
        req: {
          headers: { authorization: 'Bearer token123' },
          user: { id: 1, email: 'test@example.com' },
        },
      })),
      getArgs: jest.fn(),
      getRoot: jest.fn(),
      getInfo: jest.fn(),
    };

    (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlExecutionContext);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getRequest', () => {
    it('should return request from GraphQL context', () => {
      const expectedRequest = {
        headers: { authorization: 'Bearer token123' },
        user: { id: 1, email: 'test@example.com' },
      };

      const result = guard.getRequest(mockExecutionContext);

      expect(GqlExecutionContext.create).toHaveBeenCalledWith(mockExecutionContext);
      expect(mockGqlExecutionContext.getContext).toHaveBeenCalled();
      expect(result).toEqual(expectedRequest);
    });

    it('should handle empty context', () => {
      mockGqlExecutionContext.getContext.mockReturnValue({ req: null });

      const result = guard.getRequest(mockExecutionContext);

      expect(result).toBeNull();
    });

    it('should handle missing req in context', () => {
      mockGqlExecutionContext.getContext.mockReturnValue({});

      const result = guard.getRequest(mockExecutionContext);

      expect(result).toBeUndefined();
    });
  });

  describe('canActivate', () => {
    beforeEach(() => {
      // Mock the parent canActivate method
      jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
        .mockResolvedValue(true);
    });

    it('should return true for public routes', () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should call parent canActivate for non-public routes', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should call parent canActivate when isPublic is null', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should call parent canActivate when isPublic is undefined', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should call parent canActivate when isPublic is false', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should handle reflector errors gracefully', () => {
      const reflectorError = new Error('Reflector error');
      mockReflector.getAllAndOverride.mockImplementation(() => {
        throw reflectorError;
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Reflector error');
    });

    it('should check both handler and class metadata', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      guard.canActivate(mockExecutionContext);

      expect(mockExecutionContext.getHandler).toHaveBeenCalled();
      expect(mockExecutionContext.getClass).toHaveBeenCalled();
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        expect.any(Function),
        expect.any(Function),
      ]);
    });

    it('should return true when public decorator is explicitly true', () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle string "true" as truthy', () => {
      mockReflector.getAllAndOverride.mockReturnValue('true');

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle number 1 as truthy', () => {
      mockReflector.getAllAndOverride.mockReturnValue(1);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle empty object as truthy', () => {
      mockReflector.getAllAndOverride.mockReturnValue({});

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle empty array as truthy', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle string "false" as truthy (JavaScript behavior)', () => {
      mockReflector.getAllAndOverride.mockReturnValue('false');

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle number 0 as falsy', () => {
      mockReflector.getAllAndOverride.mockReturnValue(0);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalled();
    });

    it('should handle empty string as falsy', () => {
      mockReflector.getAllAndOverride.mockReturnValue('');

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('should create guard with reflector', () => {
      const newGuard = new JwtAuthGuard(reflector);
      expect(newGuard).toBeDefined();
      expect(newGuard).toBeInstanceOf(JwtAuthGuard);
    });

    it('should store reflector instance', () => {
      const customReflector = new Reflector();
      const newGuard = new JwtAuthGuard(customReflector);
      
      // Access private reflector through type assertion for testing
      expect((newGuard as any).reflector).toBe(customReflector);
    });
  });

  describe('integration with AuthGuard', () => {
    it('should extend AuthGuard with jwt strategy', () => {
      // Check that guard inherits from AuthGuard
      expect(guard).toBeDefined();
      expect(typeof guard.canActivate).toBe('function');
      expect(typeof guard.getRequest).toBe('function');
    });
  });
});
