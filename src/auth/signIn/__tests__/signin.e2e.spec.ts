import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../prisma/prisma.service';
import request from 'supertest';
import { SignInInput } from '../signIn.input';
import {
  CleanUpExistingTestData,
  CleanUpTestData,
} from 'test/common/cleanUp.testData';
import { User } from '@prisma/client';
import { PASSWORD_HASH, TEST_USER } from 'test/common/constants.testData';

describe('SignIn (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: User | null;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Enable class-validator for GraphQL inputs during e2e
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidUnknownValues: false }),
    );

    await app.init();

    await CleanUpExistingTestData(prisma);

    testUser =
      (await prisma.user.findFirst({
        where: {
          memberships: {
            some: {
              role: 'OWNER',
            },
          },
        },
      })) || null;

    if (!testUser) {
      throw new Error('No test user found');
    }
  });

  afterAll(async () => {
    await CleanUpTestData(prisma);
    await app.close();
  });

  describe('POST /graphql', () => {
    const gql = '/graphql';
    const signInMutation = `
        mutation SignIn($input: SignInInput!) {
            signIn(input: $input) {
                access_token
                user {
                        id
                        name
                        email
                        memberships
                    }
            }
        }
    `;

    it('should sign in with valid credentials', async () => {
      const signInInput: SignInInput = {
        email: testUser?.email || TEST_USER.email,
        password: TEST_USER.password,
      };

      const response = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: signInMutation,
          variables: {
            input: signInInput,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.signIn).toHaveProperty('access_token');
      expect(response.body.data.signIn.user.email).toBe(signInInput.email);
    });

    it('should not sign in with invalid email', async () => {
      const signInInput: SignInInput = {
        email: 'wrong@example.com',
        password: TEST_USER.password,
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: signInMutation,
          variables: {
            input: signInInput,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Invalid credentials');
    });

    it('should not sign in with invalid password', async () => {
      const signInInput: SignInInput = {
        email: testUser?.email || TEST_USER.email,
        password: 'wrongpassword',
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: signInMutation,
          variables: {
            input: signInInput,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Invalid credentials');
    });

    it('should not sign in with inactive user', async () => {
      // Create an inactive user
      const inactiveUser = await prisma.user.create({
        data: {
          email: 'inactive@example.com',
          password: PASSWORD_HASH,
          name: 'Inactive User',
          isActive: false,
        },
      });

      const signInInput: SignInInput = {
        email: 'inactive@example.com',
        password: 'password',
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: signInMutation,
          variables: {
            input: signInInput,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('User is not active');

      // Clean up
      await prisma.user.delete({ where: { id: inactiveUser.id } });
    });
  });
});
