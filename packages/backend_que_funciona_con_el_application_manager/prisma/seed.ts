import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { additionalStudents } from './students';
import { createQuizzes } from './seed/quizzes';
import { createFiles } from './seed/files';
import { resetDb } from './reset-db';
import { faker } from '@faker-js/faker';
import { createCourses } from './seed/courses';
const prisma = new PrismaClient();

async function main() {
  const hashPassword = await bcrypt.hash('password', 10);
  await resetDb();

  const courseIds = await createCourses();
  const predefinedEvent1 = await prisma.predefinedEvent.create({
    data: {
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
          {
            courseId: courseIds.course2,
          },
        ],
      },
      title: 'Both courses event',
    },
  });

  const predefinedEvent2 = await prisma.predefinedEvent.create({
    data: {
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
        ],
      },
      title: 'Course 1 event',
    },
  });

  const predefinedEvent3 = await prisma.predefinedEvent.create({
    data: {
      courses: {
        create: [
          {
            courseId: courseIds.course2,
          },
        ],
      },

      title: 'Course 2 event',
    },
  });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setHours(endDate.getHours() + 1);
  let events: any = await prisma.event.createMany({
    data: [
      {
        startDate,
        endDate,
        totalSlots: 10,
        description: 'Esto es una descripcion para un evento:)',
        title: 'Evento club 1',
        isClub: true,
      },
      {
        startDate,
        endDate,
        totalSlots: 10,
        description:
          'Esto es una descripcion para un evento:), pero este es el segundo',
        title: 'Evento club 2',
        isClub: true,
      },
      {
        // in a week
        startDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000 + 3600,
        ),
        totalSlots: 10,
        description:
          'Esto es una descripcion para un evento:), pero este es el tercero',
        title: 'Evento club 3',
        isClub: true,
      },

      {
        startDate,
        endDate,
        totalSlots: 10,
        predefinedEventId: predefinedEvent1.id,
        isClub: false,
        description: 'Hey 1',
      },
      {
        startDate,
        endDate,
        totalSlots: 10,
        predefinedEventId: predefinedEvent2.id,
        isClub: false,
        description: 'Hey 2',
      },

      {
        // in a week
        startDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000 + 3600,
        ),
        totalSlots: 10,
        predefinedEventId: predefinedEvent2.id,
        isClub: false,
        description: 'Hey 3',
      },
      {
        startDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000 + 3600,
        ),
        totalSlots: 10,
        predefinedEventId: predefinedEvent3.id,
        isClub: false,
        description: 'Hey 4',
      },
    ],
  });
  events = await prisma.event.findMany();

  await Promise.all([createQuizzes(), createFiles()]);

  // Create users
  const students: Partial<User>[] = [
    {
      id: 'thisisme',
      password: hashPassword,
      role: 'ADMIN',
      email: 'dagoma0033@gmail.com',
      firstName: 'David',
      lastName: 'Gonzalez',
      phoneNumber: '+346666797232',
    },
    {
      id: 'thisisme2',
      password: hashPassword,
      role: 'STUDENT',
      email: 'dagm0033@gmail.com',
      firstName: 'David',
      lastName: 'Gonzalez',
      phoneNumber: '+341666797232',
      birthDate: new Date(),
      address: '123 Main St',
      zipCode: '12345',
      city: 'New York',
      idNumber: '12345678900202',
      idIssueDate: new Date(),
      isInClub: true,
      courseId: 'course1',
      profilePicturePath: null,
    },
    {
      id: 'newUser1',
      password: hashPassword,
      role: 'NEWUSER',
      email: 'pepe@example.com',
    },
    {
      id: 'newUser2',
      password: hashPassword,
      role: 'NEWUSER',
      email: 'dana@example.com',
    },
    {
      id: 'student1',
      password: hashPassword,
      role: 'STUDENT',
      firstName: 'John',
      email: 'john@example.com',
      lastName: 'Doe',
      phoneNumber: '+34652697233',
      birthDate: new Date(),
      address: '123 Main St',
      zipCode: '12345',
      city: 'New York',
      idNumber: '123456780',
      idIssueDate: new Date(),
      isInClub: true,
      courseId: 'course1',
      profilePicturePath: null,
    },
    {
      id: 'student2',
      password: hashPassword,
      role: 'STUDENT',
      firstName: 'Jane',
      email: 'jane@example.com',
      lastName: 'Smith',
      phoneNumber: '+34652697232',
      birthDate: new Date(),
      address: '456 Elm St',
      zipCode: '54321',
      city: 'Los Angeles',
      idNumber: '123456781',
      idIssueDate: new Date(),
      isInClub: false,
      courseId: 'course2',
      profilePicturePath: null,
    },
    {
      id: 'student3',
      password: hashPassword,
      role: 'STUDENT',
      firstName: 'Juan',
      email: 'juan@example.com',
      lastName: 'Smith',
      phoneNumber: '+34652697222',
      birthDate: new Date(),
      address: '456 Elm St',
      zipCode: '54321',
      city: 'Los Angeles',
      idNumber: '12345678176',
      idIssueDate: new Date(),
      isInClub: true,
      courseId: null,
      profilePicturePath: null,
    },
    {
      id: 'admin1',
      password: hashPassword,
      role: 'ADMIN',
      firstName: 'Alex',
      email: 'alex@example.com',
      lastName: 'Johnson',
      phoneNumber: '+34653697232',
    },
    {
      id: 'teacher1',
      password: hashPassword,
      role: 'TEACHER',
      firstName: 'Alice',
      email: 'alice@example.com',
      lastName: 'Smith',
      phoneNumber: '+34652696232',
    },
    {
      id: 'teacher2',
      password: hashPassword,
      role: 'TEACHER',
      firstName: 'Sophia',
      email: 'sophia@example.com',
      lastName: 'Brown',
      phoneNumber: '+34662697232',
    },
    {
      id: 'awaitingteacher1',
      password: hashPassword,
      role: 'AWAITINGTEACHER',
      firstName: 'Bob',
      email: 'bob@example.com',
      lastName: 'Jones',
      phoneNumber: '+34652697272',
    },
    {
      id: 'awaitingstudent1',
      password: hashPassword,
      role: 'AWAITINGSTUDENT',
      firstName: 'Mike',
      email: 'mike@example.com',
      lastName: 'Williams',
      phoneNumber: '+34666697232',
      birthDate: new Date(),
      address: '123 Main St',
      zipCode: '12345',
      city: 'New York',
      idNumber: '1234561178A',
      idIssueDate: new Date(),
      isInClub: true,
      courseId: 'course1',
      profilePicturePath: null,
    },
    {
      id: 'awaitingstudent2',
      password: hashPassword,
      role: 'AWAITINGSTUDENT',
      firstName: 'Mary',
      email: 'mary@example.com',
      lastName: 'Davis',
      phoneNumber: '+34652697239',
      birthDate: new Date(),
      address: '123 Main St',
      zipCode: '12345',
      city: 'New York',
      idNumber: '1234567338',
      idIssueDate: new Date(),
      isInClub: true,
      courseId: 'course1',
      profilePicturePath: null,
    },
    ...additionalStudents,
  ];

  const promiseAllStudents = students.map(async (student) => {
    await prisma.user.create({
      data: student as User,
    });
  });

  await Promise.all(promiseAllStudents);

  await prisma.quizAttempt.createMany({
    data: Array.from({ length: 300 }, () => ({
      userId: 'student1',
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000),
      ),
    })),
  });

  let course1Events = await prisma.event.findMany({
    where: {
      predefinedEvent: {
        courses: {
          some: {
            courseId: courseIds.course1,
          },
        },
      },
    },
  });

  // filter repeated predefinedEvents ids

  course1Events = course1Events.filter(
    (event, index, self) =>
      index ===
      self.findIndex((t) => t.predefinedEventId === event.predefinedEventId),
  );

  const clubEvents = await prisma.event.findMany({
    where: {
      isClub: true,
    },
  });
  await prisma.usersOnEvents.createMany({
    data: course1Events.concat(clubEvents).map((event) => ({
      userId: 'student1',
      eventId: event.id,
    })),
  });

  const clubEventName = 'Evento club 3';

  const clubEvent = await prisma.event.findFirst({
    where: {
      title: clubEventName,
    },
  });

  const someStudents = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      email: {
        notIn: ['john@example.com'],
      },
    },
  });
  await prisma.usersOnEvents.createMany({
    data: [
      ...someStudents.map((student) => ({
        userId: student.id,
        eventId: clubEvent.id,
      })),
    ].slice(0, 9),
  });

  const JUNE_2023_FIRST = new Date('2023-06-01T00:00:00.000Z');
  const JULY_2023_FIRST = new Date('2023-07-01T00:00:00.000Z');
  const JANUARY_2024_FIRST = new Date('2024-01-01T00:00:00.000Z');

  const video1 = await prisma.video.create({
    data: {
      title: 'Course 1',
      url: 'https://www.youtube.com/watch?v=rSY2sUPTDDc',
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
        ],
      },
      date: JUNE_2023_FIRST,
    },
  });

  await prisma.video.create({
    data: {
      title: 'Course 1_2',
      url: 'https://www.youtube.com/watch?v=6jM_0wDOw4g',
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
        ],
      },
      date: new Date(JUNE_2023_FIRST.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.video.create({
    data: {
      url: 'https://www.youtube.com/watch?v=oY0PBQt36YM',
      title: 'Course 1_3',
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
        ],
      },
      // 6 days after
      date: new Date(JUNE_2023_FIRST.getTime() + 6 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://www.youtube.com/watch?v=6jM_0wDOw4g',
      title: 'Course 2',
      courses: {
        create: [
          {
            courseId: courseIds.course2,
          },
        ],
      },
      date: JULY_2023_FIRST,
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://www.youtube.com/watch?v=oY0PBQt36YM',
      title: 'Course 2_2',
      courses: {
        create: [
          {
            courseId: courseIds.course2,
          },
        ],
      },
      date: new Date(JULY_2023_FIRST.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://www.youtube.com/watch?v=6jM_0wDOw4g',
      title: 'Both courses',
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
          {
            courseId: courseIds.course2,
          },
        ],
      },
      date: JANUARY_2024_FIRST,
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://www.youtube.com/watch?v=oY0PBQt36YM',
      title: 'Both courses 2',
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
          {
            courseId: courseIds.course2,
          },
        ],
      },
      date: new Date(JANUARY_2024_FIRST.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://www.youtube.com/watch?v=6jM_0wDOw4g',
      title: 'Both courses 3',
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
          {
            courseId: courseIds.course2,
          },
        ],
      },
      date: new Date(JANUARY_2024_FIRST.getTime() + 6 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://www.youtube.com/watch?v=oY0PBQt36YM',
      title: 'Both courses 4',
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
          {
            courseId: courseIds.course2,
          },
        ],
      },
      date: new Date(JANUARY_2024_FIRST.getTime() + 9 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://www.youtube.com/watch?v=6jM_0wDOw4g',
      title: 'Both courses 5',
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
          {
            courseId: courseIds.course2,
          },
        ],
      },
      date: new Date(JANUARY_2024_FIRST.getTime() + 12 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://www.youtube.com/watch?v=oY0PBQt36YM',
      title: 'Both courses 6',
      courses: {
        create: [
          {
            courseId: courseIds.course1,
          },
          {
            courseId: courseIds.course2,
          },
        ],
      },
      date: new Date(JANUARY_2024_FIRST.getTime() + 15 * 24 * 60 * 60 * 1000),
    },
  });

  const chat1 = await prisma.chat.create({
    data: {
      pictureS3Key: null,
      isGroup: true,
      name: 'chat1',
      users: {
        createMany: {
          data: [
            {
              userId: (
                await prisma.user.findUnique({
                  where: {
                    id: 'student1',
                  },
                })
              ).id,
            },
            {
              userId: (
                await prisma.user.findUnique({
                  where: {
                    id: 'admin1',
                  },
                })
              ).id,
            },
          ],
        },
      },
    },
  });

  const numMessages = 80; // Number of messages to create
  const messageData = [];
  const now = new Date();

  for (let i = 0; i < numMessages; i++) {
    const senderId = i % 2 === 0 ? 'admin1' : 'student1'; // Alternate senders
    const createdAt = new Date(now); // Create a new date object
    createdAt.setMinutes(now.getMinutes() - i); // Subtract minutes
    const message = {
      content:
        faker.lorem.sentence({
          min: 2,
          max: 5,
        }) +
        ' ' +
        (numMessages - i),
      chatId: chat1.id, // Assuming chat1 is defined
      senderId: senderId,
      createdAt: createdAt,
    };

    messageData.push(message);
  }

  const messages = await prisma.message.createMany({
    data: messageData,
  });
}

// chats

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
