import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from './../database/database.service';
import { compare, compareSync, hash } from 'bcrypt';
import { exclude } from 'src/common/exclude';
import { PasswordTokenReqDto } from './dto/password-token-req.dto';
import { randomBytes } from 'crypto';
import { ResetPasswordDto } from '@aula-anclademia/backend/src/auth/dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  private readonly passwordRecoveryTokenDurationMs =
    this.configService.getOrThrow<number>(
      'PASSWORD_RECOVERY_TOKEN_DURATION_MS',
    );

  private readonly saltRounds = 10;

  private jwtCookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    signed: true,
    secure: this.configService.getOrThrow('SECURE_COOKIES'),
    maxAge: this.configService.getOrThrow('AUTH_SESSION_DURATION_MS'),
    path: '/',
    domain: process.env.HOST,
  };

  public async setAuthCookie(
    response: Response,
    { email, userId }: { email: string; userId: string },
  ) {
    response.cookie(
      this.configService.get('AUTH_COOKIE_NAME'),
      await this.generateJwtToken(email, userId),
      this.jwtCookieOptions,
    );
  }

  public async getUserIdFromJwt(jwt: string): Promise<string | null> {
    const payload = await this.jwtService.verifyAsync<{
      sub: string | undefined;
    }>(jwt);
    return payload.sub ?? null;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const INVALID_OR_EXPIRED = 'auth.INVALID_OR_EXPIRED_TOKEN';

    const { newPassword, email, token } = dto;

    const user = await this.databaseService.user.findUniqueOrThrow({
      where: {
        email,
      },
    });

    const passwordRecoveryToken =
      await this.databaseService.passwordRecoveryToken.findUnique({
        where: {
          userId: user.id,
        },
      });

    // Validate that token actually exists
    if (!passwordRecoveryToken) {
      throw new BadRequestException(INVALID_OR_EXPIRED);
    }

    // Validate that token is not expired
    if (
      passwordRecoveryToken.createdAt &&
      new Date().getTime() - passwordRecoveryToken.createdAt.getTime() >
        this.passwordRecoveryTokenDurationMs
    ) {
      throw new BadRequestException(INVALID_OR_EXPIRED);
    }

    // Validate that token matches with the hashed token in the database
    const valid = await compare(token, passwordRecoveryToken.token);

    if (!valid) throw new BadRequestException(INVALID_OR_EXPIRED);

    // Update user table with new password
    const hashedPassword = await this.hashString(newPassword);

    await this.databaseService.user.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Invalidate token
    await this.databaseService.passwordRecoveryToken.delete({
      where: {
        userId: user.id,
      },
    });
  }

  async generatePassRecoveryToken(forgotPasswordDto: PasswordTokenReqDto) {
    const user = await this.databaseService.user.findUniqueOrThrow({
      where: {
        email: forgotPasswordDto.email,
      },
    });

    // Delete previous tokens that existed for the user
    await this.databaseService.passwordRecoveryToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const token = randomBytes(6).toString('hex');

    await this.databaseService.passwordRecoveryToken.create({
      data: {
        token: await hash(token, this.saltRounds),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return token;
  }

  /**
   *
   * @param str string to be hashed
   * @returns hashed string
   */
  public async hashString(str: string) {
    return hash(str, this.saltRounds);
  }

  /**
   * Checks if email is in use
   * @param email email to be checked
   * @returns true if email is in use, false otherwise
   */
  public async checkEmailExists(email: string) {
    const user = await this.databaseService.user.findFirst({
      where: {
        email,
      },
    });

    return !!user;
  }

  /**
   * Changes user password
   *
   * @param userId user id
   * @param newPassword new password
   * @returns void
   */
  async changePassword(userId: string, newPassword: string) {
    const password = await this.hashString(newPassword);
    await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: {
        password,
      },
    });
  }

  /**
   * Checks if an email + password combination is valid
   * @param email email
   * @param password password
   * @returns user if valid, throws error otherwise
   */
  async getUserEmailPassword(email: string, password: string) {
    const user = await this.databaseService.user.findFirst({
      where: {
        email,
      },
    });

    if (!user || !compareSync(password, user.password)) {
      throw new BadRequestException('auth.INVALID_CREDENTIALS');
    }

    return exclude(user, ['password']);
  }

  /**
   * Checks if an user id + password combination is valid
   * @param userId user id
   * @param password password
   * @returns void
   * @throws Unauthorized if combination is invalid
   */
  public async authenticateIdPassword(userId: string, password: string) {
    const user = await this.databaseService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user || !compareSync(password, user.password)) {
      throw new UnauthorizedException('auth.INVALID_CREDENTIALS');
    }
  }

  /**
   * Generates a login token to be used in cookies
   * @param email email
   * @param userId user id
   * @returns login token
   */
  async generateJwtToken(email: string, userId: string) {
    const payload = { email: email, sub: userId };
    const token = await this.jwtService.signAsync(payload);
    return token;
  }

  /**
   * Checks validity of email verification code
   * @param email email
   * @param code email verification code
   * @returns true if valid, throws error otherwise
   * @throws BadRequestException if invalid, expired
   */
  async checkEmailVerificationCode(email: string, code: string) {
    const emailVerificationCode =
      await this.databaseService.emailVerificationToken.findFirst({
        where: {
          email,
        },
      });

    if (!emailVerificationCode) {
      return false;
    }

    if (
      !compareSync(code, emailVerificationCode.token) ||
      !(emailVerificationCode.createdAt > new Date(Date.now() - 30 * 60 * 1000))
    ) {
      return false;
    }

    await this.databaseService.emailVerificationToken.deleteMany({
      where: {
        email,
      },
    });

    return true;
  }

  /**
   * Creates a new user in the database
   * @param email email
   * @param password password
   * @returns user
   * @throws BadRequestException if user already exists
   */
  async registerUser(email: string, password: string) {
    const prevUser = await this.databaseService.user.findFirst({
      where: {
        email,
      },
    });
    if (prevUser) {
      throw new BadRequestException('auth.EMAIL_ALREADY_EXISTS');
    }

    const user = await this.databaseService.user.create({
      data: {
        password: await this.hashString(password),
        email,
      },
    });
    return exclude(user, ['password']);
  }

  /**
   * Generates or updates current email verification code
   * @param email email
   * @returns email verification code
   */
  async generateEmailVerificationCode(email: string) {
    const token = randomBytes(6).toString('hex');

    await this.databaseService.emailVerificationToken.deleteMany({
      where: {
        email,
      },
    });

    await this.databaseService.emailVerificationToken.create({
      data: {
        email,
        token: await this.hashString(token),
      },
    });

    return token;
  }
}
