import { Injectable } from '@nestjs/common';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { DatabaseService } from 'src/database/database.service';
import { FileSystemService } from 'src/file-system/file-system.service';

/**
 * Service for handling courses.
 */
@Injectable()
export class CoursesService {
  /**
   * Constructor for CoursesService.
   * @param {DatabaseService} databaseService - Service for database operations.
   * @param {FileSystemService} fileSystemService - Service for file system operations.
   */
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly fileSystemService: FileSystemService,
  ) {}

  /**
   * Create a new course.
   * @param {CreateCourseDto} createCourseDto - Data Transfer Object for course creation.
   */
  public async create(createCourseDto: CreateCourseDto) {
    // A root folder is auto created automatically when a course is created - every course has a root folder
    await this.databaseService.course.create({
      data: {
        ...createCourseDto,
        folders: {
          create: {
            name: 'root__' + createCourseDto.name,
            isRoot: true,
          },
        },
      },
    });
  }

  /**
   * Find all courses.
   * @returns {Promise} - Promise object represents the courses.
   */
  public async findAll() {
    const courses = await this.databaseService.course.findMany({
      include: {
        folders: {
          where: {
            isRoot: true,
          },
          select: {
            id: true,
            name: true,
          },
        },
        predefinedEvents: {
          include: {
            predefinedEvent: true,
          },
          orderBy: {
            predefinedEvent: {
              title: 'asc',
            },
          },
        },
      },
    });

    // We dont want to return the folders array, we want to return the root folder
    return courses.map((course) => ({
      folders: undefined,
      ...course,
      rootFolder: course.folders[0],
    }));
  }

  /**
   * Get student counts.
   * @returns {Promise} - Promise object represents the student counts.
   */
  public async getStudentCounts() {
    return await this.databaseService.user.groupBy({
      by: ['courseId'],
      where: {
        role: 'STUDENT',
      },
      _count: true,
    });
  }

  /**
   * Find one course.
   * @param {string} id - The id of the course.
   * @returns {Promise} - Promise object represents the course.
   */
  public async findOne(id: string) {
    return await this.databaseService.course.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Update a course.
   * @param {string} id - The id of the course.
   * @param {UpdateCourseDto} updateCourseDto - Data Transfer Object for course update.
   */
  public async update(id: string, updateCourseDto: UpdateCourseDto) {
    await this.databaseService.course.update({
      where: {
        id,
      },
      data: {
        ...updateCourseDto,
      },
    });
  }

  /**
   * Remove a course.
   * @param {string} id - The id of the course.
   */
  public async remove(id: string) {
    // delete files
    const rootFolder = await this.databaseService.folder.findFirst({
      where: {
        courseId: id,
        isRoot: true,
      },
    });
    await this.fileSystemService.removeFolder(rootFolder.id);

    // delete videos that only have this course
    const videos = await this.databaseService.video.findMany({
      where: {
        courses: {
          every: {
            courseId: id,
          },
        },
      },
    });
    await this.databaseService.video.deleteMany({
      where: {
        id: {
          in: videos.map((video) => video.id),
        },
      },
    });

    // delete predefined events that only have this course
    const predefinedEvents =
      await this.databaseService.predefinedEvent.findMany({
        where: {
          courses: {
            every: {
              courseId: id,
            },
          },
        },
      });

    await this.databaseService.predefinedEvent.deleteMany({
      where: {
        id: {
          in: predefinedEvents.map((predefinedEvent) => predefinedEvent.id),
        },
      },
    });

    // delete quizzes that only have this course
    const quizzes = await this.databaseService.quiz.findMany({
      where: {
        courses: {
          every: {
            courseId: id,
          },
        },
      },
    });

    await this.databaseService.quiz.deleteMany({
      where: {
        id: {
          in: quizzes.map((quiz) => quiz.id),
        },
      },
    });

    await this.databaseService.course.delete({
      where: {
        id,
      },
    });
  }
}
