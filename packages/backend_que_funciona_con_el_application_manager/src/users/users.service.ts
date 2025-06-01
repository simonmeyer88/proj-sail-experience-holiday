import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  UpdateManagerProfileDto,
  UpdateStudentProfileDto,
  ChangePasswordDto,
  ChangeEmailDto,
  OnboardStudentDto,
  OnboardTeacherDto,
  UpdateUserDto,
} from './dto';

import { exclude } from 'src/common/exclude';
import { AuthService } from 'src/auth/auth.service';
import { Prisma, Role } from '@prisma/client';
import { StorageService } from 'src/storage/storage.service';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as SibApiV3Sdk from '@sendinblue/client';
import { addDays, isBefore } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly authService: AuthService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  public readonly BASE_PROFILE_PICTURE_PATH = 'profile-images';

  private readonly shouldGenerateRandomPictureWhenNull: boolean =
    this.configService.getOrThrow('GENERATE_RANDOM_PROFILE_PICTURE') ===
      'true' ||
    this.configService.getOrThrow('GENERATE_RANDOM_PROFILE_PICTURE') === true;

  private sanitizeUser<
    T extends {
      password?: string | null;
      profilePicturePath?: string | null;
    },
  >(user: T) {
    return exclude(user, ['password', 'profilePicturePath']);
  }

  /*
   * Reset expired deadline for blocking calendar for users
   * */
  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_HOUR
      : CronExpression.EVERY_5_SECONDS,
  )
  public async resetExpiredCalendarDeadlines() {
    const users = await this.databaseService.user.findMany({
      where: {
        isCalendarEnable: false,
      },
    });

    const usersToUpdate = users.filter(
      (user) =>
        user.calendarBlockingDeadline &&
        isBefore(new Date(user.calendarBlockingDeadline), new Date()),
    );

    if (usersToUpdate.length > 0) {
      await this.databaseService.$transaction(
        usersToUpdate.map((user) =>
          this.databaseService.user.update({
            where: {
              id: user.id,
            },
            data: {
              calendarBlockingDeadline: null,
              isCalendarEnable: true,
            },
          }),
        ),
      );
    }
  }

  private async buildProfilePicture(originalImage: Express.Multer.File) {
    const resizedImage = await sharp(originalImage.buffer)
      .resize({ width: 150, height: 150 })
      .withMetadata()
      .toBuffer();

    // Create a new file object with the resized image
    const resizedFile: Express.Multer.File = {
      ...originalImage,
      buffer: resizedImage,
    };

    return resizedFile;
  }

  /**
   * Deletes all profile pictures that are not associated with any user
   * @returns number of deleted files
   */
  public async cleanUpOrphanedProfilePics() {
    const users = await this.databaseService.user.findMany({
      select: {
        id: true,
        profilePicturePath: true,
      },
    });

    // Lists all files in the profile-images folder
    const listedFilesKeys = await this.storageService
      .listObjects({
        Bucket: this.configService.getOrThrow('S3_PUBLIC_BUCKET_NAME'),
        Prefix: this.BASE_PROFILE_PICTURE_PATH,
      })
      .then((res) => res.Contents?.map((file) => file.Key));

    // If there are no files, return 0
    if (!listedFilesKeys || listedFilesKeys.length === 0) {
      return 0;
    }

    // Filter out the files that are associated with a user (only keep the ones that are not)
    const orphanedFilesKeys = listedFilesKeys.filter((fileKey) => {
      return !users.some((user) => user.profilePicturePath === fileKey);
    });

    if (orphanedFilesKeys.length === 0) {
      return 0;
    }

    // Delete the orphaned files
    await this.storageService.deleteObjects({
      Bucket: this.configService.getOrThrow('S3_PUBLIC_BUCKET_NAME'),
      Delete: {
        Objects: orphanedFilesKeys.map((fileKey) => {
          return {
            Key: fileKey,
          };
        }),
      },
    });

    return orphanedFilesKeys.length;
  }

  /**
   * Updates the user's email notification settings
   * @param userId
   * @param receiveEmailsOnNewEvent
   * @returns void
   * @throws NotFoundException if user is not found
   */
  public async updateEmailNotificationSettings(
    userId: string,
    receiveEmailsOnNewEvent: boolean,
  ) {
    await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: {
        receiveEmailsOnNewEvent,
      },
    });
  }

  public async setSendinblueAttribute({
    email,
    attributeKey,
    attributeValue,
  }: {
    email: string;
    attributeKey: string;
    attributeValue: string;
  }) {
    // Instantiate and config Sendinblue API
    const sendinblueApiKey =
      this.configService.getOrThrow('SENDINBLUE_API_KEY');
    const sendinblueInstance = new SibApiV3Sdk.ContactsApi();
    sendinblueInstance.setApiKey(
      SibApiV3Sdk.ContactsApiApiKeys.apiKey,
      sendinblueApiKey,
    );

    // Update contact
    const updateContact = new SibApiV3Sdk.UpdateContact();
    updateContact.attributes = {
      [attributeKey]: attributeValue,
    };
    await sendinblueInstance.updateContact(email, updateContact);
  }

  /**
   * Builds the URL of the user's profile picture. It returns a random one if configured to do so
   * @param profilePicturePath
   * @param id
   * @returns
   */
  public buildPictureUrl(profilePicturePath: string | null, id: string) {
    return profilePicturePath
      ? this.configService.getOrThrow('S3_PUBLIC_URL') +
          '/' +
          profilePicturePath
      : this.shouldGenerateRandomPictureWhenNull
      ? `https://i.pravatar.cc/150?u=${id}`
      : null;
  }

  /**
   * Updates if user is active (not active users cannot login)
   */
  public async updateIsActive(id: string, isActive: boolean) {
    await this.databaseService.user.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
    });
  }

  /**
   * Enable/disable calendar events for users
   */
  public async updateCalendarAccess(userId: string, isCalendarEnable: boolean) {
    const deadline = addDays(new Date(), 15);

    const waitlistEmails: string[] = [];

    // If disabling calendar, remove user from relevant events
    if (!isCalendarEnable) {
      const events = await this.databaseService.usersOnEvents.findMany({
        where: {
          userId,
          event: {
            startDate: {
              lte: deadline,
            },
          },
        },
        select: {
          eventId: true,
        },
      });

      // Remove user from each of the events
      await this.databaseService.usersOnEvents.deleteMany({
        where: {
          userId,
          event: {
            startDate: {
              lte: deadline,
            },
          },
        },
      });

      for (const { eventId } of events) {
        // Get users from waitlist
        const firstWaitlistedUser =
          await this.databaseService.usersOnEvents.findFirst({
            where: {
              eventId,
              waitlistEventId: eventId,
            },
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          });

        // Book users from waitlist
        if (firstWaitlistedUser) {
          await this.databaseService.usersOnEvents.update({
            where: {
              userId_eventId: {
                userId: firstWaitlistedUser.userId,
                eventId,
              },
            },
            data: {
              waitlistEventId: null,
            },
          });

          if (!waitlistEmails.includes(firstWaitlistedUser.user.email)) {
            waitlistEmails.push(firstWaitlistedUser.user.email);
          }
        }
      }
    }

    const user = await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: {
        isCalendarEnable,
        calendarBlockingDeadline: isCalendarEnable ? null : deadline,
      },
    });

    return {
      user,
      waitlistEmails,
    };
  }

  public async findOneById(id: string) {
    const user = await this.databaseService.user.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        course: true,
        chats: true,
        events: true,
        payments: true,
      },
    });

    return this.sanitizeUser({
      ...user,
      pictureUrl: this.buildPictureUrl(user.profilePicturePath, id),
    });
  }

  public async findOneByPhone(phoneNumber: string) {
    return this.databaseService.user.findUniqueOrThrow({
      where: {
        phoneNumber,
      },
    });
  }

  // ONLY return admins, teachers, and students
  public async findAllBasicInfo(where?: Prisma.UserWhereInput) {
    const users = await this.databaseService.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicturePath: true,
        role: true,
        courseId: true,
      },
      where: {
        ...where,
        role: {
          in: ['ADMIN', 'TEACHER', 'STUDENT'],
        },
      },
    });

    return users.map((user) => {
      return this.sanitizeUser({
        ...user,
        pictureUrl: this.buildPictureUrl(user.profilePicturePath, user.id),
      });
    });
  }

  public async findUsersByEmails(emails: string[]) {
    const users = await this.databaseService.user.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });

    if (!users || users.length === 0) {
      throw new NotFoundException('No users found for the provided emails');
    }

    return users.map((user) => {
      return this.sanitizeUser({
        ...user,
        pictureUrl: this.buildPictureUrl(user.profilePicturePath, user.id),
      });
    });
  }

  public async updateProfile(
    updateProfileDto: UpdateManagerProfileDto | UpdateStudentProfileDto,
    userId: string,
    newImage?: Express.Multer.File,
  ) {
    const s3ProfilePictureKey = `${this.BASE_PROFILE_PICTURE_PATH}/${userId}`;

    try {
      await this.databaseService.$transaction(async (prisma) => {
        if (newImage) {
          Logger.log('Uploading new profile picture to S3');
          newImage = await this.buildProfilePicture(newImage);
          await this.storageService.putObject({
            Bucket: this.configService.getOrThrow('S3_PUBLIC_BUCKET_NAME'),
            Body: newImage.buffer,
            Key: s3ProfilePictureKey,
            ContentType: newImage.mimetype,
          });
        }

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            ...updateProfileDto,
            profilePicturePath: newImage ? s3ProfilePictureKey : undefined,
          },
        });
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
        if (err.code === 'P2002') {
          if ((err.meta.target as string).includes('phoneNumber')) {
            throw new ConflictException('users.PHONE_NUMBER_ALREADY_IN_USE');
          }
          if ((err.meta.target as string).includes('idNumber')) {
            throw new ConflictException('users.ID_NUMBER_ALREADY_IN_USE');
          }
        }
      }

      throw new InternalServerErrorException(
        "Couldn't update profile, something went wrong on our end",
      );
    }
  }

  async onboardUser(
    onboardUserDto: OnboardStudentDto | OnboardTeacherDto,
    profilePic: Express.Multer.File,
    id: string,
  ) {
    const existingUser = await this.databaseService.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) throw new NotFoundException('User not found');

    if (existingUser.role !== 'NEWUSER') {
      throw new ConflictException('User already onboarded');
    }

    const s3ProfilePictureKey = `${this.BASE_PROFILE_PICTURE_PATH}/${id}`;

    Logger.log('Uploading new profile picture to S3');
    profilePic = await this.buildProfilePicture(profilePic);
    await this.storageService.putObject({
      Bucket: this.configService.getOrThrow('S3_PUBLIC_BUCKET_NAME'),
      Body: profilePic.buffer,
      Key: s3ProfilePictureKey,
      ContentType: profilePic.mimetype,
    });

    if (onboardUserDto instanceof OnboardStudentDto) {
      await this.databaseService.user.update({
        data: exclude(
          {
            ...onboardUserDto,
            role: 'AWAITINGSTUDENT' as Role,
            isInClub: onboardUserDto.joinClub ?? false,
            profilePicturePath: s3ProfilePictureKey,
          },
          ['joinClub'],
        ),

        where: {
          id,
        },
      });
    } else if (onboardUserDto instanceof OnboardTeacherDto) {
      await this.databaseService.user.update({
        data: {
          ...onboardUserDto,
          role: 'AWAITINGTEACHER',
          profilePicturePath: s3ProfilePictureKey,
        },
        where: { id },
      });
    } else {
      throw new InternalServerErrorException(
        "Couldn't onboard user, something went wrong on our end",
      );
    }
  }

  async changeEmail(changeEmailDto: ChangeEmailDto, userId: string) {
    await this.authService.authenticateIdPassword(
      userId,
      changeEmailDto.password,
    );

    const existingUser = await this.databaseService.user.findUnique({
      where: {
        email: changeEmailDto.newEmail,
      },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const isValid = await this.authService.checkEmailVerificationCode(
      changeEmailDto.newEmail,
      changeEmailDto.emailVerificationCode,
    );
    if (!isValid)
      throw new ConflictException('Invalid email verification code');

    await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: {
        email: changeEmailDto.newEmail,
      },
    });
  }

  async findAllPublic({
    roles,
    search,
    pendingTaskId,
    courseId,
    createdAt,
  }: {
    roles?: string[];
    search?: string;
    pendingTaskId?: string;
    courseId?: string;
    createdAt: 'asc' | 'desc';
  }) {
    search = search?.trim() || undefined;

    const searchIsFullName = search?.split(' ').length === 2;
    const users = await this.databaseService.user.findMany({
      where: {
        role: roles
          ? {
              in: roles as Role[],
            }
          : undefined,
        events: pendingTaskId
          ? {
              none: {
                event: {
                  predefinedEventId: pendingTaskId,
                },
              },
            }
          : undefined,
        course: pendingTaskId
          ? {
              predefinedEvents: {
                some: {
                  predefinedEventId: pendingTaskId,
                },
              },
            }
          : undefined,
        courseId: courseId ? courseId : undefined,
        OR: search
          ? [
              searchIsFullName
                ? {
                    firstName: {
                      contains: search?.split(' ')[0],
                    },
                    lastName: {
                      contains: search?.split(' ')[1],
                    },
                  }
                : undefined,
              {
                firstName: {
                  contains: search,
                },
              },
              {
                lastName: {
                  contains: search,
                },
              },
              {
                email: {
                  contains: search,
                },
              },
              {
                phoneNumber: {
                  contains: search,
                },
              },
              {
                phoneNumber: {
                  contains: search,
                },
              },
              {
                idNumber: {
                  contains: search,
                },
              },
            ]
          : undefined,
      },
      include: {
        payments: {
          select: {
            id: true,
          },
        },
        course: true,
        chats: true,
        events: {
          include: {
            event: true,
          },
        },
      },
      orderBy: {
        createdAt: createdAt ?? 'desc',
      },
    });

    const predefinedEvents =
      await this.databaseService.predefinedEvent.findMany({
        include: {
          courses: true,
        },
      });

    return users.map((user) => {
      const completedCourseEvents = user.events.filter((userOnEvent) => {
        return (
          userOnEvent.event.isClub === false && userOnEvent.isCompleted === true
        );
      });

      const totalCourseEvents = predefinedEvents.filter((predefinedEvent) => {
        return predefinedEvent.courses.some((course) => {
          return course.courseId === user.courseId;
        });
      });

      const progress =
        totalCourseEvents.length === 0
          ? 0
          : Math.round(
              (completedCourseEvents.length / totalCourseEvents.length) * 100,
            );
      return this.sanitizeUser({
        hasPaid: user.payments.length > 0,
        ...user,
        progress,
        course: user.course,
        pictureUrl: this.buildPictureUrl(user.profilePicturePath, user.id),
      });
    });
  }

  async findAll(where: Prisma.UserWhereInput) {
    const users = await this.databaseService.user.findMany({
      where,
      include: {
        course: true,
        chats: true,
        events: true,
      },
    });

    return users.map((user) => {
      return this.sanitizeUser({
        ...user,
        pictureUrl: this.buildPictureUrl(user.profilePicturePath, user.id),
      });
    });
  }

  /**
   * Updates an user. Intended to be used by admins, since it can modify any field
   * @param updateUserDto
   * @param userId
   * @returns void
   */
  public async updateUser(updateUserDto: UpdateUserDto, userId: string) {
    const currInfo = await this.databaseService.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    // In case the user joins or leaves the club, reset all club events
    if (updateUserDto.isInClub !== currInfo.isInClub) {
      await this.databaseService.usersOnEvents.deleteMany({
        where: {
          userId,
          event: {
            isClub: true,
          },
        },
      });
    }

    // In case the user changes course, reset all course events
    if (updateUserDto.courseId !== currInfo.courseId) {
      await this.databaseService.usersOnEvents.deleteMany({
        where: {
          userId,
          event: {
            isClub: false,
          },
        },
      });
    }

    await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: updateUserDto,
    });
  }

  /**
   * Deletes an user
   */
  public async delete(userId: string) {
    await this.databaseService.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });

      // Admins cannot be deleted with the delete endpoint
      if (user.role === 'ADMIN') {
        throw new ConflictException('users.CANNOT_DELETE_ADMIN');
      }

      // Delete all private (one to one) chats of the user (if any)
      const privateChats = await tx.chat.findMany({
        where: {
          isGroup: false,
          users: {
            some: {
              userId,
            },
          },
        },
      });
      const privateChatIds = privateChats.map((chat) => chat.id);

      if (privateChatIds.length > 0) {
        await tx.chat.deleteMany({
          where: {
            id: {
              in: privateChatIds,
            },
          },
        });
      }

      // Delete user's profile picture from S3 (if any)
      if (user.profilePicturePath) {
        await this.storageService.deleteObject({
          Bucket: this.configService.getOrThrow('S3_PUBLIC_BUCKET_NAME'),
          Key: user.profilePicturePath,
        });
      }

      // Finally, delete the user
      await tx.user.delete({
        where: {
          id: userId,
        },
      });
    });
  }

  /**
   * Changes the password of the user
   * @param changePasswordDto
   * @param userId
   * @returns
   */
  public async changePassword(
    changePasswordDto: ChangePasswordDto,
    userId: string,
  ) {
    // Check if old password is correct
    await this.authService.authenticateIdPassword(
      userId,
      changePasswordDto.oldPassword,
    );

    await this.authService.changePassword(
      userId,
      changePasswordDto.newPassword,
    );
  }

  /**
   * Accepts an user that is awaiting approval
   * @param userId
   */
  public async acceptAwaitingApproval(userId: string) {
    const user = await this.databaseService.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    // Only users awaiting approval users can be accepted
    if (user.role !== 'AWAITINGSTUDENT' && user.role !== 'AWAITINGTEACHER') {
      throw new ConflictException('User is not awaiting approval');
    }

    await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: {
        role: user.role === 'AWAITINGSTUDENT' ? 'STUDENT' : 'TEACHER',
      },
    });
  }
}
