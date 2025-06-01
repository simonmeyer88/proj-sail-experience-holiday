import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';
import { Role } from '@prisma/client';

const TEST_SENDER_EMAIL = 'sender@test.com';
const TEST_RECEIVER_EMAIL = 'receiver@test.com';
const TEST_HTML_CONTENT = 'This is a test';
const TEST_SUBJECT = 'Test subject';
describe('EmailService', () => {
  let emailService: EmailService;
  let usersService: UsersService;
  let databaseService: DatabaseService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(TEST_SENDER_EMAIL),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockReturnValue({
              email: TEST_SENDER_EMAIL,
            }),
            findAll: jest.fn(),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            event: {
              findMany: jest.fn(),
              findUniqueOrThrow: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    usersService = module.get<UsersService>(UsersService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    // So we don't actually send emails
    emailService['sendinblueInstance'] = {
      sendTransacEmail: jest.fn(),
    } as any;
  });

  it('should send an email with no params', () => {
    emailService.sendEmail({
      to: TEST_RECEIVER_EMAIL,
      subject: TEST_SUBJECT,
      htmlContent: TEST_HTML_CONTENT,
    });

    expect(
      emailService['sendinblueInstance'].sendTransacEmail,
    ).toHaveBeenCalledWith({
      params: undefined,
      bcc: [{ email: TEST_RECEIVER_EMAIL }],
      subject: TEST_SUBJECT,
      htmlContent: TEST_HTML_CONTENT,
      sender: {
        name: emailService.SENDER_NAME,
        email: TEST_SENDER_EMAIL,
      },
    });
  });

  it('should send an email with params', () => {
    const TEST_PARAMS = {
      test: 'test-param',
    };
    emailService.sendEmail({
      to: TEST_RECEIVER_EMAIL,
      subject: TEST_SUBJECT,
      htmlContent: TEST_HTML_CONTENT,
      params: TEST_PARAMS,
    });

    expect(
      emailService['sendinblueInstance'].sendTransacEmail,
    ).toHaveBeenCalledWith({
      params: TEST_PARAMS,
      bcc: [{ email: TEST_RECEIVER_EMAIL }],
      subject: TEST_SUBJECT,
      htmlContent: TEST_HTML_CONTENT,
      sender: {
        name: emailService.SENDER_NAME,
        email: TEST_SENDER_EMAIL,
      },
    });
  });

  it('should send club or course emails depending on event info -- club', async () => {
    jest.spyOn(databaseService.event, 'findUniqueOrThrow').mockResolvedValue({
      id: '1',
      title: 'Test event',
      isClub: true,
    } as any);

    jest.spyOn(usersService, 'findAll').mockResolvedValue([
      {
        email: TEST_RECEIVER_EMAIL,
      },
    ] as any);

    await emailService.sendNewEventNotification({
      eventId: '1',
    });

    expect(databaseService.event.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        id: '1',
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

    expect(usersService.findAll).toHaveBeenCalledWith({
      isInClub: true,
      role: Role.STUDENT,
      receiveEmailsOnNewEvent: true,
    });

    expect(
      emailService['sendinblueInstance'].sendTransacEmail,
    ).toHaveBeenCalledWith({
      params: {
        title: 'Test event',
      },
      bcc: [{ email: TEST_RECEIVER_EMAIL }],
      subject: emailService.NEW_EVENT_NOTIFICATION_SUBJECT,
      htmlContent: expect.any(String),
      sender: {
        name: emailService.SENDER_NAME,
        email: TEST_SENDER_EMAIL,
      },
    });
  });

  it('should send club or course emails depending on event info -- course', async () => {
    jest.spyOn(databaseService.event, 'findUniqueOrThrow').mockResolvedValue({
      id: '1',
      name: 'Test event',
      isClub: false,
      predefinedEvent: {
        title: 'Test event',
        courses: [
          {
            courseId: '1',
          },
        ],
      },
    } as any);

    jest.spyOn(usersService, 'findAll').mockResolvedValue([
      {
        email: TEST_RECEIVER_EMAIL,
      },
    ] as any);

    await emailService.sendNewEventNotification({
      eventId: '1',
    });
    expect(databaseService.event.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        id: '1',
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

    expect(usersService.findAll).toHaveBeenCalledWith({
      courseId: {
        in: ['1'],
      },
      role: Role.STUDENT,
      receiveEmailsOnNewEvent: true,
    });

    expect(
      emailService['sendinblueInstance'].sendTransacEmail,
    ).toHaveBeenCalledWith({
      params: {
        title: 'Test event',
      },
      bcc: [{ email: TEST_RECEIVER_EMAIL }],
      subject: emailService.NEW_EVENT_NOTIFICATION_SUBJECT,
      htmlContent: expect.any(String),
      sender: {
        name: emailService.SENDER_NAME,
        email: TEST_SENDER_EMAIL,
      },
    });
  });
});
