import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto, UpdateVideoDto } from './dto';
import { Auth } from 'src/auth/auth.decorator';
import { User } from 'src/auth/user.decorator';
import { User as IUser } from '@prisma/client';
import { VideosFindAllResponseItem } from './response/videos.find-all.response';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Auth('ADMIN', 'TEACHER')
  @Post()
  public async create(@Body() createVideoDto: CreateVideoDto): Promise<void> {
    await this.videosService.create(createVideoDto);
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get()
  public async findAll(
    @User() user: IUser,
    @Query('courseId') courseId?: string,
  ): Promise<VideosFindAllResponseItem[]> {
    if (!this.videosService.canUserAccessVideos(user, courseId))
      throw new ForbiddenException();

    return await this.videosService.findAll(courseId);
  }

  @Auth('ADMIN', 'TEACHER')
  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ): Promise<void> {
    await this.videosService.update(id, updateVideoDto);
  }

  @Auth('ADMIN', 'TEACHER')
  @Delete(':id')
  public async remove(@Param('id') id: string): Promise<void> {
    await this.videosService.remove(id);
  }
}
