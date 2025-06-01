import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from '@sendinblue/client';
import fs from 'fs';
import path from 'path';
import { UsersService } from 'src/users/users.service';
import { Event } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class EmailService {
  private sendinblueInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly databaseService: DatabaseService,
  ) {
    this.loadEmailsIntoMemory();
    const instance = new SibApiV3Sdk.TransactionalEmailsApi();
    instance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      configService.getOrThrow('SENDINBLUE_API_KEY'),
    );
    this.sendinblueInstance = instance;
  }

  public SENDER_NAME = 'Aula Virtual Anclademia';
  public VERIFICATION_CODE_SUBJECT = 'Código de verificación';
  public PASSWORD_RECOVERY_SUBJECT = 'Solicitud de recuperación de contraseña';
  public WELCOME_SUBJECT = 'Bienvenido a Anclademia';
  public NEW_USER_ONBOARDED_SUBJECT = 'Nuevo usuario registrado';
  public NEW_EVENT_NOTIFICATION_SUBJECT = 'Nuevo evento';
  public WAITING_LIST = 'Estabas en Lista de Espera para una Práctica';
  public CALENDAR_BLOCKED = 'Tu Calendario está bloqueado';
  public EVENT_REMINDER_SUBJECT = 'Recordatorio de tu Práctica';
  public SLOTS_WARNING_SUBJECT = 'Quedan pocas plazas para la Práctica';

  private templatesHtml: Record<string, string> = {
    emailVerificationCodeRegister: '',
    emailVerificationCodeChange: '',
    forgotPasswordCode: '',
    welcome: '',
    newUserOnboarded: '',
    newEventNotification: '',
    waitingList: '',
    calendarBlocked: '',
    eventReminder: '',
    slotsWarning: '',
  };

  private loadEmailsIntoMemory() {
    const templates = {
      emailVerificationCodeRegister: 'email-verification-code-register.html',
      emailVerificationCodeChange: 'email-verification-code-change.html',
      forgotPasswordCode: 'password-recovery-request.html',
      welcome: 'welcome.html',
      newUserOnboarded: 'new-user-onboarded.html',
      newEventNotification: 'new-event-notification.html',
      waitingList: 'waiting-list.html',
      calendarBlocked: 'calendar-blocked.html',
      eventReminder: 'event-reminder.html',
      slotsWarning: 'slots-warning.html',
    };

    Object.entries(templates).forEach(([templateKey, templateFileName]) => {
      try {
        const templatePath = path.join(
          __dirname,
          'templates',
          templateFileName,
        );
        this.templatesHtml[templateKey] = fs.readFileSync(
          templatePath,
          'utf-8',
        );
      } catch (error) {
        Logger.error(`Failed to load template: ${templateKey}`, error);
      }
    });

    Logger.log('Emails loaded into memory');
  }

  private formatDate(date: Date) {
    return date.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  public async sendEmail({
    to,
    subject,
    htmlContent,
    params,
  }: {
    to: string | string[];
    subject: string;
    htmlContent: string;
    params?: any;
  }) {
    try {
      const sendSmtpEmailParams: SibApiV3Sdk.SendSmtpEmail = {
        params,
        bcc: Array.isArray(to)
          ? to.map((email) => ({ email }))
          : [{ email: to }],
        subject,
        htmlContent,
        sender: {
          name: this.SENDER_NAME,
          email: this.configService.getOrThrow('SENDINBLUE_SENDER_EMAIL'),
        },
      };

      Logger.log(`Attempting to send email to: ${to}`);
      // await this.sendinblueInstance.sendTransacEmail(sendSmtpEmailParams);
      // Logger.log(`Email sent successfully to: ${to}`)
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Error sending email');
    }
  }

  async sendEmailVerificationCodeRegister({
    to,
    verificationCode,
  }: {
    to: string;
    verificationCode: string;
  }) {
    const template = this.templatesHtml.emailVerificationCodeRegister;
    await this.sendEmail({
      params: {
        verification_code: verificationCode,
      },
      to,
      subject: this.VERIFICATION_CODE_SUBJECT,
      htmlContent: template,
    });
  }

  async sendEmailVerificationCodeChange({
    to,
    verificationCode,
  }: {
    to: string;
    verificationCode: string;
  }) {
    const template = this.templatesHtml.emailVerificationCodeChange;

    await this.sendEmail({
      params: {
        verification_code: verificationCode,
      },
      to,
      subject: this.VERIFICATION_CODE_SUBJECT,
      htmlContent: template,
    });
  }

  async sendForgotPasswordCode({
    to,
    recoveryToken,
  }: {
    to: string;
    recoveryToken: string;
  }) {
    const template = this.templatesHtml.forgotPasswordCode;
    await this.sendEmail({
      params: {
        password_recovery_token: recoveryToken,
      },
      to,
      subject: this.PASSWORD_RECOVERY_SUBJECT,
      htmlContent: template,
    });
  }

  async sendWelcome({ to, fullName }: { to: string; fullName: string }) {
    const template = this.templatesHtml.welcome;

    await this.sendEmail({
      params: {
        fullName: fullName,
      },
      to,
      subject: this.WELCOME_SUBJECT,
      htmlContent: template,
    });
  }

  async sendEmailAboutWaitlist(to: string) {
    const template = this.templatesHtml.waitingList;

    await this.sendEmail({
      to,
      subject: this.WAITING_LIST,
      htmlContent: template,
    });
  }

  async sendEmailAboutBlockedCalendar(to: string) {
    const template = this.templatesHtml.calendarBlocked;

    await this.sendEmail({
      to,
      subject: this.CALENDAR_BLOCKED,
      htmlContent: template,
    });
  }

  async sendUserOnboardedToAdmins({ fullName }: { fullName: string }) {
    const admins = await this.usersService.findAll({
      role: 'ADMIN',
    });
    const template = this.templatesHtml.newUserOnboarded;

    for (const admin of admins) {
      await this.sendEmail({
        to: admin.email,
        params: {
          fullName,
        },
        subject: this.NEW_USER_ONBOARDED_SUBJECT,
        htmlContent: template,
      });
    }
  }

  async sendNewEventNotification({ eventId }: { eventId: string }) {
    Logger.log('Sending new event notification');
    const template = this.templatesHtml.newEventNotification;
    const event = await this.getEventWithDetails(eventId);

    if (event.isClub) {
      await this.sendClubEventNotification(event, template);
    } else {
      await this.sendCourseEventNotification(event, template);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sendEventReminders() {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours later

    const upcomingEvents = await this.databaseService.event.findMany({
      where: {
        startDate: {
          gte: new Date(reminderTime.setMinutes(0, 0, 0)), // Round to the hour
          lt: new Date(reminderTime.setMinutes(59, 59, 999)), // Until the end of the hour
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
          where: {
            waitlistEventId: null,
          },
        },
      },
    });

    if (upcomingEvents.length === 0) {
      return;
    }

    for (const event of upcomingEvents) {
      const emails = event.users.map(({ user }) => user.email);
      if (emails.length > 0) {
        await this.sendEventReminderEmails(emails, event);
      }
    }
  }

  private async getEventWithDetails(eventId: string) {
    return this.databaseService.event.findUniqueOrThrow({
      where: {
        id: eventId,
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
      },
    });
  }

  async sendSlotsWarningForAdmins(event: Event): Promise<void> {
    const admins = await this.usersService.findAll({
      role: 'ADMIN',
    });

    const emails = this.filterEmails(admins);

    if (emails.length > 0) {
      await this.sendEmail({
        to: emails,
        params: {
          title: event.title,
          date: this.formatDate(event.startDate),
        },
        subject: this.SLOTS_WARNING_SUBJECT,
        htmlContent: this.templatesHtml.slotsWarning,
      });
    }
  }

  private async sendClubEventNotification(
    event: Event,
    template: string,
  ): Promise<void> {
    const users = await this.usersService.findAll({
      isInClub: true,
      role: 'STUDENT',
      receiveEmailsOnNewEvent: true,
    });

    const emails = this.filterEmails(users);

    if (emails.length > 0) {
      await this.sendEmail({
        to: emails,
        params: {
          title: event.title,
        },
        subject: this.NEW_EVENT_NOTIFICATION_SUBJECT,
        htmlContent: template,
      });
    }
  }

  private async sendCourseEventNotification(
    event: Prisma.EventGetPayload<{
      include: {
        predefinedEvent: {
          include: {
            courses: {
              include: {
                course: true;
              };
            };
          };
        };
      };
    }>,
    template: string,
  ): Promise<void> {
    const courseIds = event.predefinedEvent?.courses.map((c) => c.courseId);
    const users = await this.usersService.findAll({
      courseId: {
        in: courseIds,
      },
      role: 'STUDENT',
      receiveEmailsOnNewEvent: true,
    });

    const emails = this.filterEmails(users);

    if (emails.length > 0) {
      await this.sendEmail({
        to: emails,
        params: {
          title: event.predefinedEvent.title,
        },
        subject: this.NEW_EVENT_NOTIFICATION_SUBJECT,
        htmlContent: template,
      });
    }
  }

  private filterEmails(users: { email: string }[]): string[] {
    let emails = users.map((user) => user.email);

    if (process.env.NODE_ENV === 'development') {
      emails = emails.filter(
        (email) => email === process.env.TEST_DEV_STUDENT_EMAIL,
      );
    }

    return emails;
  }

  private async sendEventReminderEmails(to: string[], event: Event) {
    await this.sendEmail({
      to,
      params: {
        title: event.title,
        date: this.formatDate(event.startDate),
      },
      subject: this.EVENT_REMINDER_SUBJECT,
      htmlContent: this.templatesHtml.eventReminder,
    });
  }
}

