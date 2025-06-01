import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';
import { EmailService } from '../email/email.service';
import { isBefore } from 'date-fns';

@Injectable()
export class UsersOnEventsService {
  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
  ) {}

  /**
   * Checks if user can see usersOnEvents
   * @param resourceUserId - id of the user whose usersOnEvents are being accessed
   * @param loggedInUser - user who is accessing the usersOnEvents
   * @throws ForbiddenException - if user is not admin, teacher or the user whose usersOnEvents are being accessed
   * @returns void
   */
  public async checkFindAllPermissions({
    resourceUserId,
    loggedInUser,
  }: {
    resourceUserId: string;
    loggedInUser: User;
  }) {
    if (
      resourceUserId !== loggedInUser.id &&
      loggedInUser.role !== 'ADMIN' &&
      loggedInUser.role !== 'TEACHER'
    ) {
      throw new ForbiddenException();
    }
  }

  public async findAllByUserId(userId: string) {
    return await this.databaseService.usersOnEvents.findMany({
      where: {
        user: {
          id: userId,
        },
      },
      orderBy: {
        event: {
          predefinedEvent: {
            createdAt: 'asc',
          },
        },
      },
      include: {
        event: {
          include: {
            predefinedEvent: {
              include: {
                courses: true,
              },
            },
          },
        },
      },
    });
  }
  public async delete(userId: string, eventId: string) {
    await this.databaseService.usersOnEvents.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });
  }

  public async markPastAsCompleted() {
    await this.databaseService.usersOnEvents.updateMany({
      where: {
        event: {
          endDate: {
            lte: new Date(),
          },
        },
      },
      data: {
        isCompleted: true,
      },
    });
  }

  public async artificiallyMarkPendingAsCompleted(
    userId: string,
    predefinedEventId: string,
  ) {
    // check that course is the same as the user's course
    const user = await this.databaseService.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        course: true,
      },
    });

    const studentCourseId = user.courseId;

    const predEvent =
      await this.databaseService.predefinedEvent.findUniqueOrThrow({
        where: {
          id: predefinedEventId,
        },
        include: {
          courses: true,
        },
      });

    const courseIds = predEvent.courses.map((c) => c.courseId);

    if (!courseIds.includes(studentCourseId)) {
      throw new BadRequestException('User is not in the course of the event');
    }

    // check that it is not already completed or booked
    const usersOnEvents = await this.databaseService.usersOnEvents.findMany({
      where: {
        user: {
          id: userId,
        },
        event: {
          predefinedEventId,
        },
      },
    });

    if (usersOnEvents.length > 0) {
      throw new BadRequestException(
        'User already booked or participated in this event',
      );
    }

    // generate start and end dates randomly within past 2 months, with a rounded hour, e.g. 9:00, 10:00, 11:00
    // between 9am and 9pm
    const startDate = new Date();
    const lessDays = Math.floor(Math.random() * 60);
    startDate.setDate(startDate.getDate() - lessDays);
    // hours between 9 and 21
    startDate.setHours(Math.floor(Math.random() * 12) + 9);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    await this.databaseService.usersOnEvents.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        event: {
          create: {
            // Since it is not a real event that occurred in the past, but an artificial one to maintain data consistency,
            // we set isHidden to true, so it is not queried/reachable.
            isHidden: true,
            predefinedEventId,
            startDate,
            endDate,
            description: null,
            totalSlots: 1,
            isClub: false,
          },
        },
        isCompleted: true,
      },
    });
  }

  public async updateBooking(
    updateBookingDto: UpdateBookingDto,
    eventId: string,
    userId: string,
  ) {
    await this.databaseService.$transaction(
      async (txClient) => {
        const event = await txClient.event.findUniqueOrThrow({
          where: {
            id: eventId,
          },
          include: {
            users: {
              select: {
                userId: true,
                waitlistEventId: true,
              },
            },
            waitlist: {
              orderBy: {
                createdAt: 'asc',
              },
              select: {
                user: {
                  select: {
                    email: true,
                    id: true,
                  },
                },
                createdAt: true,
              },
            },
            predefinedEvent: {
              include: {
                courses: true,
              },
            },
          },
        });

        const user = await txClient.user.findUniqueOrThrow({
          where: {
            id: userId,
          },
          include: {
            course: true,
          },
        });

        const bookedUsers = event.users.filter((user) => !user.waitlistEventId);

        const courseIds = event.predefinedEvent?.courses.map((c) => c.courseId);

        if (event.isClub && !user.isInClub) {
          throw new UnauthorizedException(
            'You are not allowed to book this event because you are not in the club',
          );
          // if it is not in club, it is in a course
        } else if (!event.isClub && !courseIds.includes(user.courseId)) {
          throw new UnauthorizedException(
            'You are not allowed to book this event because you are not in the course',
          );
        }

        const { book } = updateBookingDto;

        if (
          book &&
          !user.isCalendarEnable &&
          isBefore(new Date(), new Date(user.calendarBlockingDeadline))
        ) {
          throw new BadRequestException('events.CALENDAR_BLOCKED');
        }

        if (event.startDate < new Date()) {
          throw new BadRequestException('events.ALREADY_STARTED');
        }

        if (book) {
          if (!event.enableBooking) {
            throw new BadRequestException('events.BOOKING_DISABLED');
          }

          if (event.totalSlots <= bookedUsers.length) {
            throw new BadRequestException('events.NO_MORE_SLOTS');
          }

          const userAlreadyBooked = bookedUsers.some(
            (user) => user.userId === userId,
          );

          if (userAlreadyBooked) {
            throw new BadRequestException('User already booked');
          }

          // if it is a club event, check if the user does not have 2 or more events (booked or completed) at the same time
          if (event.isClub) {
            const usersOnEvents = await txClient.usersOnEvents.findMany({
              where: {
                user: {
                  id: userId,
                },
                isCompleted: false,
                event: {
                  isClub: true,
                },
              },
              include: {
                event: true,
              },
            });

            if (usersOnEvents.length >= 2) {
              throw new BadRequestException(
                'events.CANNOT_BOOK_MORE_THAN_2_CLUB_EVENTS',
              );
            }
          } else if (event.predefinedEventId) {
            // it is course
            const usersOnEvents = await txClient.usersOnEvents.findMany({
              where: {
                user: {
                  id: userId,
                },
                event: {
                  predefinedEventId: event.predefinedEventId,
                },
              },
            });

            // the user has already booked or participated in this event
            if (usersOnEvents.length > 0) {
              throw new BadRequestException(
                'events.ALREADY_BOOKED_OR_COMPLETED',
              );
            }
          }

          const updatedEvent = await txClient.event.update({
            where: {
              id: eventId,
            },
            data: {
              users: {
                create: {
                  userId,
                },
              },
            },
            include: {
              users: true,
            },
          });

          const freeSlots = updatedEvent.totalSlots - updatedEvent.users.length;
          if (freeSlots < 2) {
            // Notify admins about remaining slots
            this.emailService.sendSlotsWarningForAdmins(updatedEvent);
          }

          return updatedEvent;
        }

        if (!book) {
          const userAlreadyBooked = bookedUsers.some(
            (user) => user.userId === userId,
          );
          if (!userAlreadyBooked) {
            throw new BadRequestException('User has not booked this event');
          }

          await txClient.event.update({
            where: {
              id: eventId,
            },
            data: {
              users: {
                delete: {
                  userId_eventId: {
                    userId,
                    eventId,
                  },
                },
              },
            },
          });

          if (event.waitlist.length > 0) {
            // First user from waitlist
            const { user: nextUserInWaitlist } = event.waitlist[0];

            await txClient.usersOnEvents.update({
              where: {
                userId_eventId: {
                  userId: nextUserInWaitlist.id,
                  eventId: eventId,
                },
              },
              data: {
                // Remove relation with waitlist
                waitlistEventId: null,
              },
            });

            // Send email to new added user
            await this.emailService.sendEmailAboutWaitlist(
              nextUserInWaitlist.email,
            );
          }
        }
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  }

  public async updateWaitlist(
    updateWaitlistDto: UpdateWaitlistDto,
    eventId: string,
    userId: string,
  ) {
    await this.databaseService.$transaction(
      async (txClient) => {
        const event = await txClient.event.findUniqueOrThrow({
          where: {
            id: eventId,
          },
          include: {
            users: {
              select: {
                userId: true,
                waitlistEventId: true,
              },
            },
            predefinedEvent: {
              include: {
                courses: true,
              },
            },
            waitlist: {
              select: {
                userId: true,
                waitlistEventId: true,
              },
            },
          },
        });

        const user = await txClient.user.findUniqueOrThrow({
          where: {
            id: userId,
          },
          include: {
            course: true,
          },
        });

        const courseIds = event.predefinedEvent?.courses.map((c) => c.courseId);

        if (event.startDate < new Date()) {
          throw new BadRequestException('events.ALREADY_STARTED');
        }

        if (event.isClub && !user.isInClub) {
          throw new UnauthorizedException(
            'You are not allowed to sign up for this event because you are not in the club',
          );
          // if it is not in club, it is in a course
        } else if (!event.isClub && !courseIds.includes(user.courseId)) {
          throw new UnauthorizedException(
            'You are not allowed to sign up for this event because you are not in the course',
          );
        }

        const userAlreadyBooked = event.users
          .filter((user) => !user.waitlistEventId)
          .some((eventUser) => eventUser.userId === userId);

        // Prevent adding to waitlist if user is already booked
        if (userAlreadyBooked) {
          throw new BadRequestException('events.ALREADY_BOOKED_IN_WAITLIST');
        }

        const userAlreadyInWaitList = event.waitlist.some(
          (waitlistedUser) => waitlistedUser.userId === userId,
        );

        if (updateWaitlistDto.join) {
          if (
            !user.isCalendarEnable &&
            isBefore(new Date(), new Date(user.calendarBlockingDeadline))
          ) {
            throw new BadRequestException('events.CALENDAR_BLOCKED');
          }

          if (!event.enableBooking) {
            throw new BadRequestException('events.BOOKING_DISABLED');
          }

          if (userAlreadyInWaitList) {
            throw new BadRequestException('events.ALREADY_IN_WAITLIST');
          }

          if (event.isClub) {
            const usersOnEvents = await txClient.usersOnEvents.findMany({
              where: {
                user: {
                  id: userId,
                },
                isCompleted: false,
                event: {
                  isClub: true,
                },
              },
              include: {
                event: true,
              },
            });

            if (usersOnEvents.length >= 2) {
              throw new BadRequestException(
                'events.CANNOT_JOIN_WAITLIST_MORE_THAN_2_CLUB_EVENTS',
              );
            }
          }

          // Add user to the waitlist
          return txClient.event.update({
            where: {
              id: eventId,
            },
            data: {
              waitlist: {
                create: {
                  userId,
                  eventId,
                },
              },
            },
          });
        } else {
          if (!userAlreadyInWaitList) {
            throw new BadRequestException('events.NOT_IN_WAITLIST');
          }

          // Remove user from the waitlist
          return txClient.event.update({
            where: {
              id: eventId,
            },
            data: {
              waitlist: {
                delete: {
                  userId_eventId: {
                    userId,
                    eventId,
                  },
                },
              },
            },
          });
        }
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  }

  public async markUsersAsVisited(
    eventId: string,
    userId: string,
    isPresent: boolean,
  ) {
    await this.databaseService.$transaction(
      async (txClient) => {
        if (isPresent) {
          const existingRecord = await txClient.usersOnEvents.findUnique({
            where: {
              userId_eventId: {
                userId,
                eventId,
              },
            },
          });

          if (!existingRecord) {
            throw new Error(
              `Cannot mark as visited: user ${userId} is not associated with event ${eventId}`,
            );
          }

          return txClient.event.update({
            where: {
              id: eventId,
            },
            data: {
              visitedUsers: {
                connect: {
                  userId_eventId: { userId, eventId },
                },
              },
            },
          });
        } else {
          return txClient.event.update({
            where: {
              id: eventId,
            },
            data: {
              visitedUsers: {
                disconnect: {
                  userId_eventId: { userId, eventId },
                },
              },
            },
          });
        }
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  }
}
