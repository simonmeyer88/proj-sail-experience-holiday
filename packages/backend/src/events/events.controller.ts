import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  DefaultValuePipe,
  ParseBoolPipe,
  ForbiddenException,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { EventsService, RecurrenceRule } from './events.service';
import { Auth } from 'src/auth/auth.decorator';
import { User } from 'src/auth/user.decorator';
import { User as IUser, Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  CreatePredefinedEventDto,
  UpdatePredefinedEventDto,
  UpdateEventDto,
  CreateEventDto,
  GetEventsPublicResponseDto,
  UpdateBookingDto,
} from './dto';
import { PredefinedEventsService } from './predefined-events.service';
import { UsersOnEventsService } from './users-events.service';
import { ParseDatePipe } from 'src/common/parse-date.pipe';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventCreatedEvent } from 'src/event-emitter/events/event-created.event';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';
import { WoocommerceService } from '../woocommerce/woocommerce.service';

@Controller()
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly usersOnEventsService: UsersOnEventsService,
    private readonly predefinedEventsService: PredefinedEventsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly woocommerceService: WoocommerceService,
  ) {}

  @Cron(
    process.env.NODE_ENV === 'development'
      ? CronExpression.EVERY_10_SECONDS
      : CronExpression.EVERY_10_MINUTES,
  )
  public async markPastUsersOnEventsAsCompleted() {
    await this.usersOnEventsService.markPastAsCompleted();
  }

  @Auth('ADMIN', 'TEACHER')
  @Patch('events/:id')
  public async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<void> {
    await this.eventsService.update(id, updateEventDto);
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get('predefined-events')
  public async findAllPredefined(@Query('courseId') courseId?: string) {
    return await this.predefinedEventsService.findAll({
      courses: courseId && {
        some: {
          courseId,
        },
      },
    });
  }

  @Auth('ADMIN', 'TEACHER')
  @Post('predefined-events')
  public async createPredefined(
    @Body() createPredefinedEventDto: CreatePredefinedEventDto,
  ) {
    await this.predefinedEventsService.create(createPredefinedEventDto);
  }

  @Auth('ADMIN', 'TEACHER')
  @Patch('predefined-events/:id')
  public async updatePredefined(
    @Body() updatePredefinedEventDto: UpdatePredefinedEventDto,
    @Param('id') id: string,
  ) {
    await this.predefinedEventsService.update(id, updatePredefinedEventDto);
  }

  @Auth('ADMIN', 'TEACHER')
  @Delete('predefined-events/:id')
  public async deletePredefined(@Param('id') id: string): Promise<void> {
    await this.predefinedEventsService.delete(id);
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get('users-on-events/:userId')
  public async findAllUsersOnEvents(
    @Param('userId') userId: string,
    @User() user: IUser,
  ) {
    await this.usersOnEventsService.checkFindAllPermissions({
      resourceUserId: userId,
      loggedInUser: user,
    });
    return await this.usersOnEventsService.findAllByUserId(userId);
  }

  @Auth('ADMIN', 'TEACHER')
  @Delete('/users-on-events/:userId/:eventId')
  public async deleteUserOnEvent(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
  ): Promise<void> {
    await this.usersOnEventsService.delete(userId, eventId);
  }

  @Auth('ADMIN', 'TEACHER')
  @Post('events')
  public async create(@Body() createEventDto: CreateEventDto): Promise<void> {
    const event = await this.eventsService.create(createEventDto);

    if (event) {
      this.eventEmitter.emit('event.created', new EventCreatedEvent(event.id));
    }
  }

  @Auth('ADMIN', 'TEACHER')
  @Get('bookings')
  public async loadBookingsFromWoocommerce() {
    return await this.woocommerceService.retrieveBookings();
  }

  @Auth('ADMIN', 'TEACHER')
  @Post('booking-orders')
  public async loadOrdersFromWoocommerce(@Body('ids') ids: number[]) {
    return await this.woocommerceService.retrieveCurrentOrders(ids);
  }

  @Auth('STUDENT', 'ADMIN', 'TEACHER')
  @Get('events')
  public async findAllForUser(
    @User()
    user: IUser,
    @Query('date', new DefaultValuePipe(() => new Date()), ParseDatePipe)
    date: Date,
    @Query('onlyClub', new DefaultValuePipe(false), ParseBoolPipe)
    onlyClub: boolean,
    @Query('predefinedEventId')
    predefinedEventId?: string,
    @Query('courseId')
    courseId?: string,
  ) {
    const PREV_MONTH_FIRST_DAY = new Date(
      date.getFullYear(),
      date.getMonth() - 1,
      1,
    );

    const NEXT_MONTH_LAST_DAY = new Date(
      date.getFullYear(),
      date.getMonth() + 2,
      0,
    );

    if (user.role === 'TEACHER' || user.role === 'ADMIN') {
      const OR: Prisma.EventWhereInput[] = [];
      if (
        (onlyClub && predefinedEventId) ||
        (onlyClub && courseId) ||
        (predefinedEventId && courseId)
      ) {
        throw new BadRequestException(
          'You cannot filter by onlyClub, predefinedEventId or courseId at the same time',
        );
      }

      // if onlyClub is specified, filter by it
      if (onlyClub) {
        OR.push({
          isClub: true,
        });
      }
      // if predefinedEventId is specified, filter by it
      else if (predefinedEventId) {
        OR.push({
          predefinedEventId,
        });
      } else if (courseId) {
        OR.push({
          predefinedEvent: {
            courses: {
              some: {
                courseId,
              },
            },
          },
        });
      }
      return this.eventsService.findAll({
        OR: OR.length ? OR : undefined,
        startDate: {
          gte: PREV_MONTH_FIRST_DAY,
          lt: NEXT_MONTH_LAST_DAY,
        },
      });
    } else {
      if (predefinedEventId || onlyClub || courseId) {
        throw new ForbiddenException(
          'You cannot filter by predefinedEventId, onlyClub or courseId',
        );
      }
      const userIsInClub = user.isInClub;
      let OR: Prisma.EventWhereInput[] = [];

      if (userIsInClub) {
        OR = [
          {
            isClub: true,
          },
          {
            isClub: false,
            predefinedEvent: user.courseId && {
              courses: {
                some: {
                  courseId: user.courseId,
                },
              },
            },
          },
        ];
      } else {
        OR = [
          {
            isClub: false,
            predefinedEvent: user.courseId && {
              courses: {
                some: {
                  courseId: user.courseId,
                },
              },
            },
          },
        ];
      }

      return this.eventsService.findAll({
        OR,
        startDate: {
          gte: PREV_MONTH_FIRST_DAY,
          lt: NEXT_MONTH_LAST_DAY,
        },
      });
    }
  }

  @Auth('ADMIN', 'TEACHER')
  @Delete('events/:id/')
  public async remove(
    @Param('id') id: string,
    @Query('recurrence') recurrence?: RecurrenceRule,
  ): Promise<void> {
    await this.eventsService.remove(id, recurrence);
  }

  @Auth('STUDENT', 'ADMIN', 'TEACHER')
  @Post('users-on-events/:eventId/:userId/bookings')
  public async updateBooking(
    @Body() updateBookingDto: UpdateBookingDto,
    @User() currentUser: IUser,
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    // Admins and teachers can modify bookings of other users
    if (currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') {
      await this.usersOnEventsService.updateBooking(
        updateBookingDto,
        eventId,
        userId,
      );
      return;
      // Students can only modify their own bookings
    } else if (currentUser.id === userId) {
      await this.usersOnEventsService.updateBooking(
        updateBookingDto,
        eventId,
        userId,
      );
      return;
    }
    throw new ForbiddenException();
  }

  @Auth('STUDENT', 'ADMIN', 'TEACHER')
  @Post('users-on-events/:eventId/:userId/waitlist')
  public async updateWaitlist(
    @Body() updateWaitlistDto: UpdateWaitlistDto,
    @User() currentUser: IUser,
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    if (currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') {
      await this.usersOnEventsService.updateWaitlist(
        updateWaitlistDto,
        eventId,
        userId,
      );

      return;
    } else if (currentUser.id === userId) {
      await this.usersOnEventsService.updateWaitlist(
        updateWaitlistDto,
        eventId,
        userId,
      );
      return;
    }
    throw new ForbiddenException();
  }

  @Auth('ADMIN', 'TEACHER')
  @Put('users-on-events/:eventId/:userId/mark-presence')
  async markUsersAsVisited(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Body('isPresent') isPresent: boolean,
  ) {
    await this.usersOnEventsService.markUsersAsVisited(
      eventId,
      userId,
      isPresent,
    );
  }

  @Auth('ADMIN', 'TEACHER')
  @Post('mark-predefined-events-as-completed/:predefinedEventId/:userId')
  public async markUsersOnEventsAsCompleted(
    @Param('predefinedEventId') predefinedEventId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.usersOnEventsService.artificiallyMarkPendingAsCompleted(
      userId,
      predefinedEventId,
    );
  }

  // Used by a public frontend
  @Get('events/public')
  public async findAllPublic(
    @Query('date', new DefaultValuePipe(() => new Date()), ParseDatePipe)
    date: Date,
    @Query('courseId')
    courseId: string,
  ) {
    if (!courseId) {
      throw new BadRequestException('courseId is required');
    }
    // courseId can also be 'CLUB' for club events

    const PREV_MONTH_FIRST_DAY = new Date(
      date.getFullYear(),
      date.getMonth() - 1,
      1,
    );

    const NEXT_MONTH_LAST_DAY = new Date(
      date.getFullYear(),
      date.getMonth() + 2,
      0,
    );

    const events = await this.eventsService.findAll({
      startDate: {
        gte: PREV_MONTH_FIRST_DAY,
        lt: NEXT_MONTH_LAST_DAY,
      },
      isClub: courseId === 'CLUB' ? true : undefined,
      predefinedEvent:
        courseId !== 'CLUB'
          ? {
              courses: {
                some: {
                  courseId,
                },
              },
            }
          : undefined,
    });
    return events.map((event) => new GetEventsPublicResponseDto(event));
  }
}
