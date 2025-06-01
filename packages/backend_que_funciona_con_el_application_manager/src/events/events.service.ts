import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  getDay,
  isBefore,
  isSameDay,
} from 'date-fns';
import { EmailService } from '../email/email.service';

export type RecurrenceRule =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'annually'
  | 'weekdays'
  | 'customDays'
  | 'customDates';

@Injectable()
export class EventsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly usersService: UsersService,
    private emailService: EmailService,
  ) {}

  public async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.databaseService.event.findUnique({
      where: {
        id,
      },
    });
    const takenSlots = await this.databaseService.usersOnEvents.count({
      where: {
        eventId: id,
        waitlistEventId: null,
      },
    });

    // Cannot update total slots to less than the number of taken slots
    if (
      updateEventDto.enableBooking &&
      updateEventDto.totalSlots < takenSlots
    ) {
      throw new BadRequestException('events.TOTAL_SLOTS_LESS_THAN_BOOKED');
    }

    // Can only update title if the event is a club event
    if (updateEventDto.title) {
      if (!event.isClub) {
        throw new BadRequestException(
          'Cannot update title if the event is not a club event',
        );
      }
    }

    const updatedEvent = await this.databaseService.event.update({
      where: {
        id,
      },
      include: {
        waitlist: {
          orderBy: {
            createdAt: 'asc',
          },
          where: {
            waitlistEventId: id,
          },
          select: {
            user: {
              select: {
                email: true,
                id: true,
              },
            },
          },
        },
        users: {
          where: {
            waitlistEventId: null,
          },
        },
      },
      data: updateEventDto,
    });

    const freeSlots = updatedEvent.totalSlots - updatedEvent.users.length;

    if (freeSlots < 2) {
      // Notify admins about remaining slots
      this.emailService.sendSlotsWarningForAdmins(updatedEvent);
    }

    // If total slots were changed
    if (
      updateEventDto.enableBooking &&
      event.totalSlots !== updateEventDto.totalSlots
    ) {
      // If event has free slots for users in waitlist
      if (
        updatedEvent.waitlist.length > 0 &&
        updatedEvent.totalSlots > updatedEvent.users.length
      ) {
        const freeSlots = updatedEvent.totalSlots - updatedEvent.users.length;
        const waitlistedUsers = updatedEvent.waitlist.slice(0, freeSlots);
        const waitlistedUsersIds = waitlistedUsers.map(({ user }) => user.id);

        if (waitlistedUsersIds.length > 0) {
          // Add users from waitlist for booking list
          await this.databaseService.usersOnEvents.updateMany({
            where: {
              userId: {
                in: waitlistedUsersIds,
              },
              eventId: updatedEvent.id,
              waitlistEventId: updatedEvent.id,
            },
            data: {
              waitlistEventId: null,
            },
          });

          // Notify users from waitlist
          for (const { user } of waitlistedUsers) {
            await this.emailService.sendEmailAboutWaitlist(user.email);
          }
        }
      }

      return updatedEvent;
    }
  }

  public async create({ repeatDays, ...body }: CreateEventDto) {
    if (body.recurrenceRule || repeatDays) {
      return this.createMany({
        ...body,
        repeatDays,
      });
    }

    if (body.isClub) {
      return this.databaseService.event.create({
        data: {
          ...body,
          predefinedEventId: null,
        },
      });
    }

    return this.databaseService.event.create({
      data: {
        ...body,
        title: null,
      },
    });
  }

  public async createMany(createEventDto: CreateEventDto) {
    const events = [];
    let { startDate, endDate } = createEventDto;
    const { repeatDays, repeatDates, recurrenceRule, recurrenceEnd, ...body } =
      createEventDto;

    const isWeekdays = recurrenceRule === 'weekdays';

    // If repeatDates is passed and contains dates, use the earliest date in the array as the start date
    if (repeatDates && repeatDates.length > 0) {
      const firstDate = new Date(
        Math.min(...repeatDates.map((date) => date.getTime())),
      );

      // Checking that the earliest date is not past
      if (isBefore(firstDate, new Date())) {
        throw new BadRequestException(
          'events.START_DATE_MUST_BE_IN_THE_FUTURE',
        );
      }

      startDate = firstDate;
      endDate = addHours(firstDate, 1);
    }

    // Set end of recurrence
    const end = recurrenceEnd
      ? addDays(recurrenceEnd, 1)
      : addYears(startDate, recurrenceRule === 'annually' ? 10 : 1);

    const days = isWeekdays ? [1, 2, 3, 4, 5] : repeatDays ?? [];

    // Generate events until the recurrence end date
    while (isBefore(startDate, end)) {
      if (repeatDates || repeatDays || isWeekdays) {
        if (repeatDates) {
          if (repeatDates.some((date) => isSameDay(date, startDate))) {
            events.push({
              ...body,
              recurrenceEnd: end,
              recurrenceRule,
              startDate,
              endDate,
            });
          }
        } else {
          const date = getDay(startDate);

          if (days.includes(date)) {
            events.push({
              ...body,
              recurrenceEnd: end,
              recurrenceRule,
              startDate,
              endDate,
            });
          }
        }

        startDate = addDays(startDate, 1);
        endDate = addDays(endDate, 1);
      } else {
        events.push({
          ...body,
          recurrenceEnd: end,
          recurrenceRule,
          startDate,
          endDate,
        });

        if (recurrenceRule === 'daily') {
          // Increment by one day
          startDate = addDays(startDate, 1);
          endDate = addDays(endDate, 1);
        } else if (recurrenceRule === 'weekly') {
          // Increment by one week
          startDate = addWeeks(startDate, 1);
          endDate = addWeeks(endDate, 1);
        } else if (recurrenceRule === 'monthly') {
          // Increment by one month
          startDate = addMonths(startDate, 1);
          endDate = addMonths(endDate, 1);
        } else if (recurrenceRule === 'annually') {
          // Increment by one year
          startDate = addYears(startDate, 1);
          endDate = addYears(endDate, 1);
        }
      }
    }

    if (events.length > 0) {
      // Save all events to the database
      const createdEvents = await this.databaseService.$transaction(
        events.map((event) =>
          this.databaseService.event.create({
            data: event,
          }),
        ),
      );

      return createdEvents[0];
    }
  }

  public async deleteMany(id: string, recurrenceRule: RecurrenceRule) {
    const targetEvent = await this.databaseService.event.findUnique({
      where: {
        id,
      },
    });

    const events = await this.databaseService.event.findMany({
      where: {
        recurrenceRule,
        createdAt: targetEvent.createdAt,
        startDate: {
          gte: targetEvent.startDate,
        },
      },
    });

    const eventIds = events.map((event) => event.id);
    const eventDates = events.map((event) => event.createdAt);

    await this.databaseService.event.deleteMany({
      where: {
        id: {
          in: eventIds,
        },
        createdAt: {
          in: eventDates,
        },
      },
    });
  }

  public async findAll(where?: Prisma.EventWhereInput) {
    const events = await this.databaseService.event.findMany({
      where: {
        ...where,
        isHidden: false,
      },
      include: {
        predefinedEvent: {
          include: {
            courses: {
              include: {
                course: true,
              },
            },
          },
        },
        users: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePicturePath: true,
                idNumber: true,
              },
            },
          },
        },
        waitlist: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePicturePath: true,
                idNumber: true,
              },
            },
            createdAt: true,
          },
        },
        visitedUsers: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return events.map((event) => {
      const waitlistUserIds = new Set(
        event.waitlist.map((relation) => relation.user.id),
      );

      const common = {
        id: event.id,
        endDate: event.endDate,
        startDate: event.startDate,
        totalSlots: event.totalSlots,
        users: event.users
          .map((relation) => relation.user)
          .filter((user) => !waitlistUserIds.has(user.id))
          .map((user) => ({
            ...user,
            pictureUrl: this.usersService.buildPictureUrl(
              user.profilePicturePath,
              user.id,
            ),
          })),
        waitlist: event.waitlist.map((relation) => ({
          ...relation.user,
          pictureUrl: this.usersService.buildPictureUrl(
            relation.user.profilePicturePath,
            relation.user.id,
          ),
        })),
        description: event.description,
        color: event.color,
        recurrenceRule: event.recurrenceRule,
        recurrenceEnd: event.recurrenceEnd,
        enableBooking: event.enableBooking,
        visitedUsers: event.visitedUsers.map((relation) => relation.user.id),
      };
      if (event.isClub) {
        return {
          ...common,
          title: event.title,
          courses: [],
          isClub: true,
        };
      } else {
        return {
          ...common,
          courses: event.predefinedEvent.courses.map((relation) => ({
            id: relation.course.id,
            name: relation.course.name,
          })),
          isClub: false,
          title: event.predefinedEvent.title,
        };
      }
    });
  }

  public async remove(id: string, recurrenceRule?: RecurrenceRule) {
    if (recurrenceRule) {
      return this.deleteMany(id, recurrenceRule);
    }

    await this.databaseService.event.delete({
      where: {
        id,
      },
    });
  }

  public async findOne(id: string) {
    return this.databaseService.event.findUnique({
      where: {
        id,
      },
      include: {
        predefinedEvent: {
          include: {
            courses: true,
          },
        },
      },
    });
  }
}
