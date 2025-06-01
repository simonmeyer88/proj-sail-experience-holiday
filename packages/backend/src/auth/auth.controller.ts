import {
  Controller,
  Post,
  Body,
  Res,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import {
  RegisterDto,
  LoginDto,
  EmailVerificationCodeReqDto,
  PasswordTokenReqDto,
  ResetPasswordDto,
} from './dto';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import { Auth } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  public async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const user = await this.authService.getUserEmailPassword(
      loginDto.email,
      loginDto.password,
    );

    if (!user.isActive) {
      throw new ForbiddenException();
    }

    await this.authService.setAuthCookie(response, {
      userId: user.id,
      email: user.email,
    });
  }

  @Post('register')
  public async register(
    @Body() createUserDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const isCodeValid = await this.authService.checkEmailVerificationCode(
      createUserDto.email,
      createUserDto.emailVerificationCode,
    );

    if (!isCodeValid) {
      throw new BadRequestException('auth.INVALID_OR_EXPIRED_TOKEN');
    }

    const user = await this.authService.registerUser(
      createUserDto.email,
      createUserDto.password,
    );

    await this.authService.setAuthCookie(response, {
      userId: user.id,
      email: user.email,
    });
  }

  @Post('logout')
  public async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    response.clearCookie(this.configService.get('AUTH_COOKIE_NAME'));
  }

  @Post('email-verification/register')
  public async generateEmailVerificationCode(
    @Body() emailVerificationCodeReqDto: EmailVerificationCodeReqDto,
  ): Promise<void> {
    // Cannot register with email that already exists
    const emailExists = await this.authService.checkEmailExists(
      emailVerificationCodeReqDto.email,
    );
    if (emailExists) {
      throw new BadRequestException('auth.EMAIL_ALREADY_EXISTS');
    }
    const emailVerificationCode =
      await this.authService.generateEmailVerificationCode(
        emailVerificationCodeReqDto.email,
      );

    await this.emailService.sendEmailVerificationCodeRegister({
      to: emailVerificationCodeReqDto.email,
      verificationCode: emailVerificationCode,
    });
  }

  @Post('email-verification/change-email')
  @Auth()
  public async changeEmail(
    @Body() emailVerificationCodeReqDto: EmailVerificationCodeReqDto,
  ): Promise<void> {
    const emailExists = await this.authService.checkEmailExists(
      emailVerificationCodeReqDto.email,
    );
    if (emailExists) {
      throw new BadRequestException('auth.EMAIL_ALREADY_EXISTS');
    }
    const emailVerificationCode =
      await this.authService.generateEmailVerificationCode(
        emailVerificationCodeReqDto.email,
      );

    await this.emailService.sendEmailVerificationCodeChange({
      to: emailVerificationCodeReqDto.email,
      verificationCode: emailVerificationCode,
    });
  }

  @Post('forgot-password/request')
  public async emailPasswordRecoveryToken(
    @Body() dto: PasswordTokenReqDto,
  ): Promise<void> {
    const token = await this.authService.generatePassRecoveryToken(dto);

    await this.emailService.sendForgotPasswordCode({
      to: dto.email,
      recoveryToken: token,
    });
  }

  @Post('forgot-password/change')
  public async changePassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto);
  }
}
