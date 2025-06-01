import { Injectable } from '@nestjs/common';
import { CreateVideoDto, UpdateVideoDto } from './dto';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client';

/**
 * Service for handling video related operations
 */
@Injectable()
export class VideosService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Checks if a user can access videos
   * @param user - The user to check
   * @param courseId - The course ID to check against
   * @returns - Boolean indicating if the user can access videos
   */
  public canUserAccessVideos(user: User, courseId?: string | null) {
    const { role } = user;
    if (role !== 'ADMIN' && role !== 'TEACHER') {
      if (!courseId) {
        return false;
      }
      if (courseId !== user.courseId) {
        return false;
      }
    }
    return true;
  }

  /**
   * Creates a new video
   * @param createVideoDto - The video data to create
   */
  public async create(createVideoDto: CreateVideoDto) {
    const { courseIds, ...rest } = createVideoDto;
    await this.databaseService.video.create({
      data: {
        ...rest,
        courses: {
          createMany: {
            data: courseIds.map((courseId) => ({
              courseId,
            })),
          },
        },
      },
    });
  }

  /**
   * Finds all videos
   * @param courseId - The course ID to filter by
   * @returns - An array of videos
   */
  public async findAll(courseId?: string | null) {
    const videos = await this.databaseService.video.findMany({
      orderBy: {
        date: 'asc',
      },
      where: courseId && {
        courses: {
          some: {
            courseId,
          },
        },
      },
      include: {
        courses: {
          select: {
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const res = videos.map((video) => ({
      ...video,
      courses: video.courses.map((course) => course.course),
    }));

    return res;
  }

  /**
   * Finds a single video
   * @param id - The ID of the video to find
   * @returns - The video data
   */
  public async findOne(id: string) {
    const video = await this.databaseService.video.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        courses: {
          select: {
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      ...video,
      courses: video.courses.map((course) => course.course),
    };
  }

  /**
   * Updates a video
   * @param id - The ID of the video to update
   * @param updateVideoDto - The new video data
   */
  public async update(id: string, updateVideoDto: UpdateVideoDto) {
    await this.databaseService.video.update({
      where: {
        id,
      },
      data: {
        title: updateVideoDto.title,
        url: updateVideoDto.url,
        courses: {
          deleteMany: {},
          createMany: {
            data: updateVideoDto.courseIds.map((courseId) => ({
              courseId,
            })),
          },
        },
        date: updateVideoDto.date,
      },
    });
  }

  /**
   * Removes a video
   * @param id - The ID of the video to remove
   */
  public async remove(id: string) {
    await this.databaseService.video.delete({
      where: {
        id,
      },
    });
  }
}
