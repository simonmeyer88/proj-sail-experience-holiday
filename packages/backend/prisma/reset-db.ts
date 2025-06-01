import { PrismaClient } from '@prisma/client';

export async function resetDb() {
  const prisma = new PrismaClient();
  await prisma.video.deleteMany();
  await prisma.user.deleteMany();
  await prisma.quiz.deleteMany();
  // Disable foreign key checks
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;

  // Truncate the table
  await prisma.$executeRaw`TRUNCATE TABLE File;`;
  await prisma.$executeRaw`TRUNCATE TABLE Folder;`;

  // Re-enable foreign key checks
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;

  await prisma.course.deleteMany();
  await prisma.predefinedEvent.deleteMany();
  await prisma.event.deleteMany();
  await prisma.webPushSubscription.deleteMany();
  await prisma.chatsOnUsers.deleteMany();
  await prisma.chat.deleteMany();
}
