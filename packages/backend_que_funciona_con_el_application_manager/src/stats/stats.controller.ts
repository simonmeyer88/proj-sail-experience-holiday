import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { Auth } from 'src/auth/auth.decorator';
import { User } from 'src/auth/user.decorator';
import { User as IUser } from '@prisma/client';
import {
  StatsAdminResponse,
  StatsTeacherResponse,
  StatsStudentResponse,
} from './stats.response';
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}
  @Get('admin')
  @Auth('ADMIN')
  async getStatsAdmin(): Promise<StatsAdminResponse> {
    return await this.statsService.getStatsAdmin();
  }
  @Get('teacher')
  @Auth('TEACHER', 'ADMIN')
  async getStatsTeacher(): Promise<StatsTeacherResponse> {
    return await this.statsService.getStatsTeacher();
  }

  @Get('student')
  @Auth('STUDENT')
  async getStatsStudent(@User() user: IUser): Promise<StatsStudentResponse> {
    return await this.statsService.getStatsStudent(user);
  }
}
