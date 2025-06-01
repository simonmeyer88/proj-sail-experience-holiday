import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseBoolPipe,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/auth/auth.decorator';
import { UsersService } from './users.service';
import {
  UpdateManagerProfileDto,
  UpdateStudentProfileDto,
  ChangeEmailDto,
  UpdateUserDto,
  ChangePasswordDto,
  OnboardStudentDto,
  OnboardTeacherDto,
  GetAllUsersQueryDto,
} from './dto';

import { User as IUser } from '@prisma/client';
import { User } from 'src/auth/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  MAX_PROFILEPIC_FILE_SIZE,
  VALID_PROFILEPIC_MIMETYPES,
} from '@aula-anclademia/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserOnboardedEvent } from 'src/event-emitter/users/user-onboarded.event';
import { UserAcceptedEvent } from 'src/event-emitter/users/user-accepted.event';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_DAY_AT_4AM
      : CronExpression.EVERY_5_SECONDS,
  )
  async cleanUpOrphanedProfilePics() {
    const deleted = await this.usersService.cleanUpOrphanedProfilePics();
    Logger.log(`Deleted ${deleted} orphaned user profile pics`);
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get('basic-info')
  async getBasicInfo() {
    const users = await this.usersService.findAllBasicInfo();

    return users;
  }

  @Auth('ALL')
  @Get('me')
  getMeProfile(@User('id') userId: string) {
    return this.usersService.findOneById(userId);
  }

  @Auth('ADMIN', 'TEACHER')
  @Get(':id')
  getUser(@Param('id') userId: string) {
    return this.usersService.findOneById(userId);
  }

  @Auth('ADMIN', 'TEACHER')
  @Get('phone/:number')
  getUserByPhone(@Param('number') phone: string) {
    return this.usersService.findOneByPhone(phone);
  }

  @Auth('ADMIN', 'TEACHER')
  @Get()
  async getAllUsers(
    @Query()
    { pendingTaskId, roles, search, courseId, createdAt }: GetAllUsersQueryDto,
  ) {
    if (typeof search !== 'string' && typeof search !== 'undefined') {
      throw new BadRequestException('Invalid search query');
    }

    const users = await this.usersService.findAllPublic({
      pendingTaskId,
      roles,
      search,
      courseId,
      createdAt,
    });

    return users;
  }

  @Auth('ADMIN', 'TEACHER')
  @Post('find-by-emails')
  async getUsersByEmails(@Body('emails') emails: string[]) {
    if (!emails || emails.length === 0) {
      throw new BadRequestException('Email array cannot be empty');
    }

    const users = await this.usersService.findUsersByEmails(emails);

    return users;
  }

  @Auth('ADMIN')
  @Put(':id')
  updateUserInfo(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(updateUserDto, userId);
  }

  @Auth('ADMIN')
  @Put(':id/is-active')
  updateIsActive(
    @Param('id') userId: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    return this.usersService.updateIsActive(userId, isActive);
  }

  @Auth('ADMIN')
  @Put(':id/calendar-access')
  async updateCalendarAccess(
    @Param('id') userId: string,
    @Body('isCalendarEnable', ParseBoolPipe) isCalendarEnable: boolean,
  ) {
    const { user, waitlistEmails } =
      await this.usersService.updateCalendarAccess(userId, isCalendarEnable);

    // Send email to blocked user
    if (!user.isCalendarEnable) {
      this.eventEmitter.emit('user.calendar_blocked', user.email);
    }

    // Send email to waitlist users
    if (waitlistEmails.length > 0) {
      waitlistEmails.forEach((email) => {
        this.eventEmitter.emit('user.waitlist', email);
      });
    }
  }

  @Auth('ADMIN')
  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return this.usersService.delete(userId);
  }

  @UseInterceptors(FileInterceptor('newImage'))
  @Auth('STUDENT', 'ADMIN', 'TEACHER')
  @Put('me/update-profile')
  updateProfile(
    @Body({
      transform: async (value) => {
        let transformed: UpdateManagerProfileDto | UpdateStudentProfileDto;
        if (value.birthDate) {
          transformed = plainToInstance(UpdateStudentProfileDto, value);
        } else {
          transformed = plainToInstance(UpdateManagerProfileDto, value);
        }

        const validation = await validate(transformed);
        if (validation.length > 0) {
          const validationPipe = new ValidationPipe();
          const exceptionFactory = validationPipe.createExceptionFactory();
          throw exceptionFactory(validation);
        }

        return transformed;
      },
    })
    updateProfileDto: UpdateManagerProfileDto | UpdateStudentProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PROFILEPIC_FILE_SIZE }),
        ],
      }),
    )
    newImage: Express.Multer.File | undefined,
    @User() user: IUser,
  ) {
    if (newImage) {
      if (!VALID_PROFILEPIC_MIMETYPES.includes(newImage.mimetype)) {
        throw new BadRequestException('Invalid image mimetype');
      }
    }
    if (updateProfileDto instanceof UpdateStudentProfileDto) {
      if (user.role != 'STUDENT') {
        throw new BadRequestException('You are not a student');
      }
      return this.usersService.updateProfile(
        updateProfileDto,
        user.id,
        newImage,
      );
    } else if (updateProfileDto instanceof UpdateManagerProfileDto) {
      if (user.role != 'ADMIN' && user.role != 'TEACHER') {
        throw new BadRequestException('You are not a manager');
      }
      return this.usersService.updateProfile(
        updateProfileDto,
        user.id,
        newImage,
      );
    }
  }

  @Auth('STUDENT', 'ADMIN', 'TEACHER')
  @Put('me/password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User('id') userId: string,
  ) {
    return this.usersService.changePassword(changePasswordDto, userId);
  }

  @Auth('NEWUSER')
  @Put('me/onboard')
  @UseInterceptors(FileInterceptor('profilePic'))
  async onboardUser(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PROFILEPIC_FILE_SIZE }),
        ],
      }),
    )
    profilePic: Express.Multer.File,
    @Body({
      transform: async (value) => {
        let transformed: OnboardTeacherDto | OnboardStudentDto;
        if (value.birthDate) {
          transformed = plainToInstance(OnboardStudentDto, value);
        } else {
          transformed = plainToInstance(OnboardTeacherDto, value);
        }

        const validation = await validate(transformed);
        if (validation.length > 0) {
          const validationPipe = new ValidationPipe();
          const exceptionFactory = validationPipe.createExceptionFactory();
          throw exceptionFactory(validation);
        }

        return transformed;
      },
    })
    onboardUserDto: OnboardTeacherDto | OnboardStudentDto,
    @User('id') userId: string,
  ) {
    await this.usersService.onboardUser(onboardUserDto, profilePic, userId);

    const user = await this.usersService.findOneById(userId);

    this.eventEmitter.emit(
      'user.onboarded',
      new UserOnboardedEvent(userId, user.firstName + ' ' + user.lastName),
    );
  }

  @Auth('ADMIN')
  @Put(':id/accept')
  async acceptUser(@Param('id') userId: string) {
    await this.usersService.acceptAwaitingApproval(userId);
    const user = await this.usersService.findOneById(userId);
    await this.usersService
      .setSendinblueAttribute({
        email: user.email,
        attributeKey: 'WHATSAPP',
        attributeValue: user.phoneNumber,
      })
      .catch((e) => Logger.error(e));

    this.eventEmitter.emit(
      'user.accepted',
      new UserAcceptedEvent(
        userId,
        user.firstName + ' ' + user.lastName,
        user.email,
      ),
    );
  }

  @Auth('STUDENT', 'ADMIN', 'TEACHER')
  @Put('me/email')
  changeEmail(
    @Body() changeEmailDto: ChangeEmailDto,
    @User('id') userId: string,
  ) {
    return this.usersService.changeEmail(changeEmailDto, userId);
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Put('me/email-notifications')
  changeEmailNotifications(
    @Body('receiveEmailsOnNewEvent', ParseBoolPipe)
    receiveEmailsOnNewEvent: boolean,
    @User('id') userId: string,
  ) {
    return this.usersService.updateEmailNotificationSettings(
      userId,
      receiveEmailsOnNewEvent,
    );
  }
}
