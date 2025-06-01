import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  MaxFileSizeValidator,
  ParseFilePipe,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizQuestionsDto } from './dto/update-quiz-questions.dto';
import { UpdateQuizMetadataDto } from './dto/update-quiz-metadata.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/auth/auth.decorator';
import { MAX_QUIZ_FILE_SIZE } from '@aula-anclademia/common';
import { User } from 'src/auth/user.decorator';
import { User as IUser } from '@prisma/client';
import { QuizRandomQuestionsResponse } from './response/quiz-random-questions.response';
import { QuizFindOneResponse } from './response/quiz-find-one.response';
import { ForbiddenException } from '@nestjs/common';
import { QuizFindAllResponse } from './response/quiz-find-all.response';
import { QuizFindAllPermissionsGuard } from './guards/quiz-find-all-permissions.guard';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Auth('ADMIN', 'TEACHER')
  @Post()
  @UseInterceptors(FileInterceptor('excelFile'))
  public async create(
    @Body() createFileDto: CreateQuizDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new MaxFileSizeValidator({ maxSize: MAX_QUIZ_FILE_SIZE })],
      }),
    )
    excelFile: Express.Multer.File,
  ): Promise<void> {
    this.quizService.validateQuizMimeType(excelFile);
    await this.quizService.create(createFileDto, excelFile);
  }

  @UseGuards(QuizFindAllPermissionsGuard)
  @Auth('STUDENT', 'ADMIN', 'TEACHER')
  @Get()
  public async findAll(
    @User() user: IUser,
    @Query('courseId') courseId?: string,
  ): Promise<QuizFindAllResponse> {
    // this throws an incorrect typing error ???
    // @ts-ignore
    return await this.quizService.findAll(courseId);
  }

  @Auth('ADMIN', 'TEACHER')
  @Get(':id')
  public async findOne(@Param('id') id: string): Promise<QuizFindOneResponse> {
    return await this.quizService.findOne(id);
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get(':id/random-questions')
  public async getWithRandomQuestions(
    @Param('id') id: string,
  ): Promise<QuizRandomQuestionsResponse> {
    return await this.quizService.getWithRandomQuestions(id);
  }

  @Auth('ADMIN', 'TEACHER')
  @Patch(':id/questions')
  public async updateQuestions(
    @Param('id') id: string,
    @Body() dto: UpdateQuizQuestionsDto,
  ): Promise<void> {
    await this.quizService.updateQuestions(id, dto);
  }

  @Auth('ADMIN', 'TEACHER')
  @Patch(':id/metadata')
  public async updateMetadata(
    @Param('id') id: string,
    @Body() dto: UpdateQuizMetadataDto,
  ): Promise<void> {
    await this.quizService.updateMetadata(id, dto);
  }

  @Auth('STUDENT')
  @Post('submit')
  public async submit(@User() user: IUser): Promise<void> {
    await this.quizService.addQuizSubmission(user.id);
  }

  @Auth('ADMIN', 'TEACHER')
  @Delete(':id')
  public async remove(@Param('id') id: string): Promise<void> {
    await this.quizService.remove(id);
  }
}
