import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  CoursesFindAllResponseItem,
  StudentCountsResponseItem,
} from './response';
import { Auth } from 'src/auth/auth.decorator';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}
  @Auth('ADMIN', 'TEACHER')
  @Post()
  public async create(@Body() createCourseDto: CreateCourseDto): Promise<void> {
    await this.coursesService.create(createCourseDto);
  }

  @Auth('STUDENT', 'NEWUSER', 'ADMIN', 'TEACHER')
  @Get()
  public async findAll(): Promise<CoursesFindAllResponseItem[]> {
    return await this.coursesService.findAll();
  }

  @Auth('ADMIN', 'TEACHER')
  @Get('student-counts')
  public async getStudentCounts(): Promise<StudentCountsResponseItem[]> {
    return await this.coursesService.getStudentCounts();
  }

  @Auth('ADMIN', 'TEACHER')
  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<void> {
    await this.coursesService.update(id, updateCourseDto);
  }

  @Auth('ADMIN', 'TEACHER')
  @Delete(':id')
  public async remove(@Param('id') id: string): Promise<void> {
    await this.coursesService.remove(id);
  }
}
