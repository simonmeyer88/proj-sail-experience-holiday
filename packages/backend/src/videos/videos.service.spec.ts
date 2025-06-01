import { Test, TestingModule } from '@nestjs/testing';
import { VideosService } from './videos.service';
import { DatabaseModule } from 'src/database/database.module';
import { VideosController } from './videos.controller';
import { DatabaseService } from 'src/database/database.service';

describe('VideosService', () => {
  let service: VideosService;
  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [
        VideosService,
        {
          provide: DatabaseService,
          useValue: null,
        },
      ],
      imports: [DatabaseModule],
    }).compile();

    service = module.get<VideosService>(VideosService);
  });
  it('check user permissions', async () => {
    const testBuilder = (
      role: string,
      studentCourseId: string,
      courseId: string,
    ) => {
      return service.canUserAccessVideos(
        {
          role,
          courseId: studentCourseId,
        } as any,
        courseId,
      );
    };

    // if user is admin or teacher, return true
    expect(testBuilder('ADMIN', null, 'test')).toEqual(true);
    expect(testBuilder('TEACHER', null, 'test')).toEqual(true);

    // if user is student and they are enrolled to the same course, return true
    expect(testBuilder('STUDENT', 'test', 'test')).toEqual(true);

    // if user is student and they are not enrolled to a course, return false
    expect(testBuilder('STUDENT', null, 'test')).toEqual(false);

    // if user is student and they are enrolled to diff a course, return false
    expect(testBuilder('STUDENT', 'diff', 'test')).toEqual(false);
  });
});
