import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCourses() {
  const ids = {
    course1: 'course1',
    course2: 'course2',
  };
  await prisma.course.create({
    data: {
      id: ids.course1,
      name: 'Course 1',
      folders: {
        create: [
          {
            name: 'root_course1',
            isRoot: true,
          },
        ],
      },
    },
  });

  await prisma.course.create({
    data: {
      id: ids.course2,
      name: 'Course 2',
      folders: {
        create: [
          {
            name: 'root_course2',
            isRoot: true,
          },
        ],
      },
    },
  });

  return ids;
}
