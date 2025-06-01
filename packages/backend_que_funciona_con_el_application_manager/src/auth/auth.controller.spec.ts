import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let configService: ConfigService;

  const generateEmailVerificationCodeMock: jest.Mock = jest.fn();
  const checkEmailVerificationCodeMock: jest.Mock = jest.fn();
  const registerUserMock: jest.Mock = jest.fn();
  const getUserEmailPasswordMock: jest.Mock = jest.fn();
  const generateJwtTokenMock: jest.Mock = jest.fn();
  const setAuthCookieMock: jest.Mock = jest.fn();

  // register
  const registerDto: RegisterDto = {
    email: 'test@email.com',
    password: 'testpassword',
    emailVerificationCode: 'testcode',
  };

  // login
  const loginDto = {
    email: 'test@email.com',
    password: 'testpassword',
  };
  const loginUser = {
    id: 'testid',
    email: loginDto.email,
    isActive: true,
  };

  checkEmailVerificationCodeMock.mockResolvedValue(true);
  registerUserMock.mockResolvedValue({
    id: 'testid',
    email: registerDto.email,
  });
  const registerResponse = {
    cookie: jest.fn(),
  } as unknown as Response;

  const logoutResponse = {
    clearCookie: jest.fn(),
  } as unknown as Response;

  const loginResponse = {
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();
    getUserEmailPasswordMock.mockResolvedValue(loginUser);
    generateJwtTokenMock.mockResolvedValue('testtoken');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: DatabaseService,
          useValue: jest.fn(),
        },
        {
          provide: EmailService,
          useValue: {
            sendEmailVerificationCodeRegister: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            checkEmailExists: jest.fn(),
            generateEmailVerificationCode: generateEmailVerificationCodeMock,
            checkEmailVerificationCode: checkEmailVerificationCodeMock,
            registerUser: registerUserMock,
            getUserEmailPassword: getUserEmailPasswordMock,
            generateJwtToken: generateJwtTokenMock,
            setAuthCookie: setAuthCookieMock,
          },
        },
        {
          provide: UsersService,
          useValue: jest.fn(),
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

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should checkEmailVerificationCode (register)', async () => {
    await authController.register(registerDto, registerResponse);
    expect(authService.checkEmailVerificationCode).toHaveBeenCalledWith(
      registerDto.email,
      registerDto.emailVerificationCode,
    );
  });

  it('should call registerUser from service (register)', async () => {
    await authController.register(registerDto, registerResponse);
    expect(authService.registerUser).toHaveBeenCalledWith(
      registerDto.email,
      registerDto.password,
    );
  });

  it('should call setAuthCookie', async () => {
    await authController.register(registerDto, registerResponse);
    expect(authService.setAuthCookie).toHaveBeenCalledWith(registerResponse, {
      email: registerDto.email,
      userId: 'testid',
    });
  });

  it('should set cookie (register)', async () => {
    await authController.register(registerDto, registerResponse);
    expect(authService.setAuthCookie).toHaveBeenCalledWith(registerResponse, {
      email: registerDto.email,
      userId: 'testid',
    });
  });

  it('should return success message (register)', async () => {
    await authController.register(registerDto, registerResponse);
  });

  it('should call getUserEmailPassword (login)', async () => {
    await authController.login(loginDto, loginResponse);
    expect(authService.getUserEmailPassword).toHaveBeenCalledWith(
      loginDto.email,
      loginDto.password,
    );
  });

  it('should call setAuthCookie (login)', async () => {
    await authController.login(loginDto, loginResponse);
    expect(authService.setAuthCookie).toHaveBeenCalledWith(loginResponse, {
      email: loginUser.email,
      userId: loginUser.id,
    });
  });

  it('should set cookie (login)', async () => {
    await authController.login(loginDto, loginResponse);
    expect(authService.setAuthCookie).toHaveBeenCalledWith(loginResponse, {
      email: loginUser.email,
      userId: loginUser.id,
    });
  });

  it('should return success message (login)', async () => {
    const res = await authController.login(loginDto, loginResponse);
  });

  it('should clear cookie (logout)', async () => {
    const logoutResponse = {
      clearCookie: jest.fn(),
    } as unknown as Response;
    await authController.logout(logoutResponse);
    expect(logoutResponse.clearCookie).toHaveBeenCalledWith(
      configService.getOrThrow('AUTH_COOKIE_NAME'),
    );
  });

  const emailVerificationCodeReqDto = {
    email: 'test@test.com',
  };

  it('should checkEmailExists', async () => {
    await authController.generateEmailVerificationCode(
      emailVerificationCodeReqDto,
    );
    expect(authService.checkEmailExists).toHaveBeenCalledWith(
      emailVerificationCodeReqDto.email,
    );
  });

  it('should generateEmailVerificationCode', async () => {
    await authController.generateEmailVerificationCode(
      emailVerificationCodeReqDto,
    );
    expect(authService.generateEmailVerificationCode).toHaveBeenCalledWith(
      emailVerificationCodeReqDto.email,
    );
  });
});
