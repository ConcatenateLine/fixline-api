import { Test } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../prisma/prisma.service';
import request from 'supertest';
import { APP_GUARD } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../../auth/guards/jwtAuth.guard';
import { JwtService } from '@nestjs/jwt';

describe('User Creation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testCounter = 0;
  let authHeader: Record<string, string>;
  let jwtService: JwtService;

  const createTestUser = () => ({
    email: `test${testCounter++}@example.com`,
    name: 'Test User',
    password: 'SecurePass123!',
  });

  class TestBypassJwtGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req;
      // Optional: stub a user expected by resolvers
      req.user = { id: 1, email: 'admin@acme.com', memberships: [] };
      return true;
    }
  }

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      // More targeted override to ensure JwtAuthGuard is bypassed
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      // Keep the APP_GUARD override as a fallback in case multi-guards exist
      .overrideProvider(APP_GUARD)
      .useClass(TestBypassJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Prepare a valid JWT in case the guard path still executes
    const secret = process.env.JWT_SECRET || 'defaultSecretKey';
    const token = jwtService.sign(
      { sub: 'e2e-user', email: 'e2e@example.com', memberships: [] },
      { secret },
    );
    authHeader = { Authorization: `Bearer ${token}` };

    // Enable class-validator for GraphQL inputs during e2e
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidUnknownValues: false }),
    );

    await app.init();
  });

  afterEach(async () => {
    try {
      // Use deleteMany only to avoid P2025 when not found
      await prisma.user.deleteMany({
        where: { email: { contains: '@example.com' } },
      });
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /graphql', () => {
    const gql = '/graphql';
    const createUserMutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          email
          name
          isActive
          createdAt
        }
      }
    `;

    it('should create a new user', async () => {
      const userInput = createTestUser();

      const { body } = await request(app.getHttpServer())
        .post(gql)
        .set(authHeader)
        .send({
          query: createUserMutation,
          variables: { input: userInput },
        })
        .expect(200);

      const user = body.data?.createUser;

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userInput.email);
      expect(user.name).toBe(userInput.name);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeDefined();

      // Verify user exists in database
      const dbUser = await prisma.user.findUnique({
        where: { email: userInput.email },
      });
      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(userInput.email);
      expect(dbUser?.name).toBe(userInput.name);
    });

    it('should not allow duplicate emails', async () => {
      const userInput = createTestUser();

      // First create a user
      const primaryUser = await request(app.getHttpServer())
        .post(gql)
        .set(authHeader)
        .send({
          query: createUserMutation,
          variables: { input: userInput },
        })
        .expect(200);

      // Try to create another user with the same email
      const { body } = await request(app.getHttpServer())
        .post(gql)
        .set(authHeader)
        .send({
          query: createUserMutation,
          variables: { input: userInput },
        })
        .expect(200);


      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toContain('already exists');
    });

    it('should validate input data', async () => {
      const testCases = [
        {
          input: { email: 'invalid-email', name: '', password: 'short' },
          expectedErrors: ['email', 'name', 'password'],
        },
        {
          input: { email: 'valid@test.com', name: 'Test', password: '' },
          expectedErrors: ['password'],
        },
      ];

      for (const { input, expectedErrors } of testCases) {
        const { body } = await request(app.getHttpServer())
          .post(gql)
          .set(authHeader)
          .send({
            query: createUserMutation,
            variables: { input },
          })
          .expect(200);

        expect(body.errors).toBeDefined();
        const errorMessages = JSON.stringify(body.errors);
        expectedErrors.forEach((error) => {
          expect(errorMessages).toContain(error);
        });
      }
    });
  });
});
