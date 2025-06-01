import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { OnEvent } from '@nestjs/event-emitter';
import { UserOnboardedEvent } from 'src/event-emitter/users/user-onboarded.event';
import { UserAcceptedEvent } from 'src/event-emitter/users/user-accepted.event';
import { EventCreatedEvent } from 'src/event-emitter/events/event-created.event';

@Injectable()
export class EmailEventHandler {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent('user.onboarded')
  public async handleUserOnboardedEvent(payload: UserOnboardedEvent) {
    await this.emailService.sendUserOnboardedToAdmins({
      fullName: payload.fullName,
    });
  }

  @OnEvent('user.accepted')
  public async handleUserAcceptedEvent(payload: UserAcceptedEvent) {
    await this.emailService.sendWelcome({
      to: payload.email,
      fullName: payload.fullName,
    });
  }

  @OnEvent('event.created')
  public async handleEventCreatedEvent(payload: EventCreatedEvent) {
    this.emailService.sendNewEventNotification({
      eventId: payload.eventId,
    });
  }

  @OnEvent('user.calendar_blocked')
  public async handleUserBlockedCalendar(to: string) {
    this.emailService.sendEmailAboutBlockedCalendar(to);
  }

  @OnEvent('user.waitlist')
  public async handleBookingForWaitlist(to: string) {
    this.emailService.sendEmailAboutWaitlist(to);
  }
}
