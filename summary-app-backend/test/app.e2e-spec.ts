import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Summary App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same configuration as in main.ts
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    });
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Authentication Endpoints', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('/auth/register (POST) - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('user');
          expect(response.body).toHaveProperty('access_token');
          expect(response.body.user.email).toBe(testUser.email);
        });
    });

    it('/auth/register (POST) - should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('/auth/register (POST) - should return 400 for short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('/auth/login (POST) - should login with valid credentials', async () => {
      // First register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      // Then login
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('user');
          expect(response.body).toHaveProperty('access_token');
        });
    });

    it('/auth/login (POST) - should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('AI Endpoints', () => {
    it('/ai/test (GET) - should test AI connection', () => {
      return request(app.getHttpServer())
        .get('/ai/test')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status');
          expect(response.body).toHaveProperty('message');
        });
    });
  });

  describe('Protected Endpoints', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login to get auth token
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'protected-test@example.com',
          password: 'password123',
        });

      authToken = registerResponse.body.access_token;
    });

    it('/auth/profile (GET) - should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('email');
          expect(response.body).toHaveProperty('interests');
        });
    });

    it('/auth/profile (GET) - should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('/auth/interests (PATCH) - should update user interests', () => {
      const newInterests = ['teknoloji', 'bilim', 'sanat'];

      return request(app.getHttpServer())
        .patch('/auth/interests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ interests: newInterests })
        .expect(200)
        .then((response) => {
          expect(response.body.interests).toEqual(newInterests);
        });
    });

    it('/ai/summarize (POST) - should summarize text with valid token', () => {
      return request(app.getHttpServer())
        .post('/ai/summarize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Bu uzun bir test metnidir. AI bu metni özetlemelidir.' })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('summary');
          expect(response.body).toHaveProperty('keywords');
        });
    });
  });
});
