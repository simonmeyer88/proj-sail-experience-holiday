import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from 'src/database/database.service';
import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { exclude } from 'src/common/exclude';
import { User } from '@prisma/client';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';

describe('AuthService', () => {
  let service: AuthService;
  let testUser: User;
  const prismaUserFindFirstMock: jest.Mock = jest.fn();
  const prismaUserCreateMock: jest.Mock = jest.fn();
  const prismaUserUdpdateMock: jest.Mock = jest.fn();

  const prismaEmailVerificationFindFirstMock: jest.Mock = jest.fn();
  const prismaEmailVerificationUpsertMock: jest.Mock = jest.fn();
  const prismaEmailVerificationDeleteManyMock: jest.Mock = jest.fn();
  const prismaEmailVerificationCreateMock: jest.Mock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findFirst: prismaUserFindFirstMock,
              create: prismaUserCreateMock,
              update: prismaUserUdpdateMock,
            },
            emailVerificationToken: {
              upsert: prismaEmailVerificationUpsertMock,
              findFirst: prismaEmailVerificationFindFirstMock,
              deleteMany: prismaEmailVerificationDeleteManyMock,
              create: prismaEmailVerificationCreateMock,
            },
          },
        },
      ],
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
          cache: true,
          load: [
            () => ({
              SECURE_COOKIES: process.env.NODE_ENV === 'production',
            }),
          ],
          validationSchema: Joi.object({
            NODE_ENV: Joi.string()
              .valid('development', 'production', 'test')
              .default('development'),
            PORT: Joi.number().default(3000),
            DATABASE_URL: Joi.string().required(),
            AUTH_COOKIE_NAME: Joi.string().default(
              '__aula_anclademia_sessiontoken',
            ),
            JWT_SECRET: Joi.string().required(),
            COOKIE_SECRET: Joi.string().required(),
            S3_ACCESS_KEY_ID: Joi.string().required(),
            S3_SECRET_ACCESS_KEY: Joi.string().required(),
            S3_REGION: Joi.string().required(),
            S3_ENDPOINT: Joi.string().required(),
            S3_PUBLIC_URL: Joi.string().required(),
            S3_PUBLIC_BUCKET_NAME: Joi.string().required(),
            S3_PRIVATE_BUCKET_NAME: Joi.string().required(),
            HOST_DOMAIN: Joi.string().required(),
            SENDINBLUE_API_KEY: Joi.string().required(),
            GENERATE_RANDOM_PROFILE_PICTURE: Joi.boolean().default(false),
            ZOOM_WEBHOOK_SECRET: Joi.string().required(),
            VAPID_PUBLIC_KEY: Joi.string().required(),
            VAPID_PRIVATE_KEY: Joi.string().required(),
            AUTH_SESSION_DURATION_MS: Joi.number().default(
              1000 * 60 * 60 * 24 * 3,
            ),
            PASSWORD_RECOVERY_TOKEN_DURATION_MS: Joi.number().default(
              1000 * 60 * 30,
            ),
            LOG_SNAG_API_KEY: Joi.string().optional(),
            LOG_SNAG_ACTIVE: Joi.boolean().default(false),
            LOG_SNAG_PROJECT: Joi.string()
              .optional()
              .default('aula-anclademia'),
          }),
          validationOptions: {
            allowUnknown: true,
            abortEarly: true,
          },
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.getOrThrow('JWT_SECRET'),
            signOptions: {
              expiresIn:
                configService.getOrThrow('AUTH_SESSION_DURATION_MS') / 1000,
            },
          }),
        }),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    testUser = {
      id: 'testid',
      email: 'test@email.com',
      password: 'testpassword',
    } as User;
  });

  it('should hash password (hashPassword)', async () => {
    const password = testUser.password;
    const hashedPassword = await service.hashString(password);
    expect(hashedPassword).not.toEqual(password);
    expect(bcrypt.compareSync(password, hashedPassword)).toEqual(true);
  });

  it('should check if email exists (hasPassword)', async () => {
    prismaUserFindFirstMock.mockResolvedValueOnce(testUser);
    const res1 = await service.checkEmailExists(testUser.email);
    expect(res1).toEqual(true);
    const res2 = await service.checkEmailExists('doesntexist@email.com');
    expect(res2).toEqual(false);
  });

  it('should change password (changePassword)', async () => {
    const newPassword = 'newpassword';
    await service.changePassword(testUser.id, newPassword);
    // any password is fine
    expect(prismaUserUdpdateMock).toHaveBeenCalledWith({
      where: { id: testUser.id },
      data: { password: expect.any(String) },
    });
  });

  it('should return user (getUserEmailPassword)', async () => {
    prismaUserFindFirstMock.mockResolvedValueOnce({
      ...testUser,
      password: await service.hashString(testUser.password),
    });
    const res = await service.getUserEmailPassword(
      testUser.email,
      testUser.password,
    );
    expect(res).toEqual(exclude(testUser, ['password']));
  });

  it('should throw error if user not found (getUserEmailPassword)', async () => {
    prismaUserFindFirstMock.mockResolvedValueOnce(null);
    await expect(
      service.getUserEmailPassword(testUser.email, testUser.password),
    ).rejects.toThrow(new BadRequestException('auth.INVALID_CREDENTIALS'));
  });

  it('should generate jwt token (generateJwtToken) ', async () => {
    const token = await service.generateJwtToken(testUser.email, testUser.id);
    expect(token).toEqual(expect.any(String));
  });

  it('should return true if code is valid (checkEmailVerificationCode)', async () => {
    const code = 'testcode';

    const hashedCode = await service.hashString(code);
    prismaEmailVerificationFindFirstMock.mockResolvedValueOnce({
      id: 1,
      token: hashedCode,
      email: testUser.email,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    const res = await service.checkEmailVerificationCode(testUser.email, code);

    expect(prismaEmailVerificationFindFirstMock).toHaveBeenCalledWith({
      where: {
        email: testUser.email,
      },
    });
    expect(res).toEqual(true);
  });

  it('should return false if code is invalid or expired (checkEmailVerificationCode)', async () => {
    const code = 'testcode';
    prismaEmailVerificationFindFirstMock.mockResolvedValueOnce(null);
    const res1 = await service.checkEmailVerificationCode(testUser.email, code);
    expect(res1).toEqual(false);

    prismaEmailVerificationFindFirstMock.mockResolvedValueOnce({
      id: 1,
      token: code,
      email: testUser.email,
      updatedAt: new Date(Date.now() - 100000000000),
    });

    const res2 = await service.checkEmailVerificationCode(testUser.email, code);
    expect(res2).toEqual(false);
  });

  it('should create user (registerUser)', async () => {
    prismaUserCreateMock.mockResolvedValueOnce(testUser);
    const res = await service.registerUser(testUser.email, testUser.password);
    expect(res).toEqual(testUser);
  });

  it('should throw error if user already exists (registerUser)', async () => {
    prismaUserFindFirstMock.mockResolvedValueOnce(testUser);
    await expect(
      service.registerUser(testUser.email, testUser.password),
    ).rejects.toThrow(new BadRequestException('auth.EMAIL_ALREADY_EXISTS'));
  });

  it('should create email verification code (createEmailVerificationCode)', async () => {
    const code = await service.generateEmailVerificationCode(testUser.email);
    expect(code).toEqual(expect.any(String));

    // Test that previous code is deleted
    expect(prismaEmailVerificationDeleteManyMock).toHaveBeenCalledWith({
      where: {
        email: testUser.email,
      },
    });

    // Test that new code is created
    expect(prismaEmailVerificationCreateMock).toHaveBeenCalledWith({
      data: {
        email: testUser.email,
        token: expect.any(String),
      },
    });
  });
});
