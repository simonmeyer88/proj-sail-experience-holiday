import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizQuestionsDto } from './dto/update-quiz-questions.dto';
import { UpdateQuizMetadataDto } from './dto/update-quiz-metadata.dto';
import { DatabaseService } from '../database/database.service';
import * as XLSX from 'xlsx';
import { VALID_QUIZ_MIMETYPES } from '@aula-anclademia/common';
import Joi from 'joi';
import { User as IUser, Question } from '@prisma/client';

@Injectable()
export class QuizService {
  constructor(private readonly databaseService: DatabaseService) {}

  validateQuizMimeType(excelFile: Express.Multer.File) {
    const type = excelFile.mimetype;
    if (VALID_QUIZ_MIMETYPES.includes(type) === false) {
      throw new BadRequestException('INVALID_MIMETYPE');
    }
  }

  public async addQuizSubmission(userId: string) {
    await this.databaseService.quizAttempt.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  private readDataFromExcel(excelFile: Express.Multer.File) {
    const workBook = XLSX.read(excelFile.buffer);
    const data = XLSX.utils.sheet_to_json(
      workBook.Sheets[workBook.SheetNames[0]],
    );
    return data;
  }

  private transformRow(row: any) {
    Joi.assert(
      row,
      Joi.object({
        opt1: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
        opt2: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
        opt3: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
        opt4: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
        // if it is a number, it should be between 1 and 4, can be undefined or null
        correct: Joi.alternatives()
          .try(Joi.number().valid(1, 2, 3, 4), Joi.string())
          .optional(),

        title: Joi.string().required(),
      }),
      'INVALID_FORMAT',
      {
        stripUnknown: true,
        allowUnknown: true,
      },
    );
    type ValidatedRow = {
      opt1: string | number;
      opt2: string | number;
      opt3: string | number;
      opt4: string | number;
      correct: number | null | undefined;
      title: string;
    };
    const _row = row as ValidatedRow;
    _row.opt1 = _row.opt1.toString();
    _row.opt2 = _row.opt2.toString();
    _row.opt3 = _row.opt3.toString();
    _row.opt4 = _row.opt4.toString();
    _row.correct = isNaN(parseInt((_row.correct || '1') as string))
      ? 1
      : parseInt((_row.correct || '1') as string);

    return _row as {
      opt1: string;
      opt2: string;
      opt3: string;
      opt4: string;
      correct: number;
      title: string;
    };
  }

  async create(createQuizDto: CreateQuizDto, excelFile: Express.Multer.File) {
    await this.databaseService.$transaction(
      async (tx) => {
        const data = this.readDataFromExcel(excelFile);
        const quiz = await tx.quiz.create({
          data: {
            name: createQuizDto.name,
            courses: {
              createMany: {
                data: createQuizDto.courseIds.map((courseId) => ({
                  courseId,
                })),
              },
            },
          },
        });

        for (const _row of data) {
          const row = this.transformRow(_row);

          const question = await tx.question.create({
            data: {
              content: row.title,
              quiz: {
                connect: {
                  id: quiz.id,
                },
              },
            },
          });

          await tx.answer.createMany({
            data: [
              {
                content: row.opt1,
                isCorrect: row.correct === 1,
                questionId: question.id,
              },
              {
                content: row.opt2,
                isCorrect: row.correct === 2,
                questionId: question.id,
              },
              {
                content: row.opt3,
                isCorrect: row.correct === 3,
                questionId: question.id,
              },
              {
                content: row.opt4,
                isCorrect: row.correct === 4,
                questionId: question.id,
              },
            ],
          });
        }
      },
      // TODO: concurrent transactions
      {
        timeout: 30000,
      },
    );
  }

  async findAll(courseId?: string) {
    const data = await this.databaseService.quiz.findMany({
      include: {
        courses: {
          select: {
            course: true,
          },
        },
      },
      where: {
        courses: {
          some: {
            courseId,
          },
        },
      },
      orderBy: {
        name: 'desc',
      },
    });

    return data.map((quiz) => ({
      ...quiz,
      courses: quiz.courses.map((c) => c.course),
    }));
  }

  async findOne(id: string) {
    const quiz = await this.databaseService.quiz.findUniqueOrThrow({
      where: {
        id: id,
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
    return quiz;
  }

  private pickRandomQuestions<T>(arr: T[], count: number): T[] {
    const result = [];
    for (let i = 0; i < count; i++) {
      const random = Math.floor(Math.random() * arr.length);
      result.push(arr.splice(random, 1)[0]);
    }
    return result;
  }

  async getWithRandomQuestions(id: string) {
    const quiz = await this.databaseService.quiz.findUnique({
      where: {
        id: id,
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });

    quiz.questions = this.pickRandomQuestions<(typeof quiz.questions)[number]>(
      quiz.questions,
      quiz.nQuestionsPerAttempt,
    );

    return quiz;
  }

  async updateQuestions(id: string, dto: UpdateQuizQuestionsDto) {
    const { questions } = dto;

    for (const q of questions) {
      await this.databaseService.question.update({
        where: {
          id: q.id,
        },
        data: {
          answers: {
            update: {
              where: {
                id: q.newCorrectAnswerId,
              },
              data: {
                isCorrect: true,
              },
            },
            updateMany: {
              where: {
                id: {
                  not: q.newCorrectAnswerId,
                },
              },
              data: {
                isCorrect: false,
              },
            },
          },
        },
      });
    }
  }

  public async updateMetadata(id: string, dto: UpdateQuizMetadataDto) {
    const { nQuestionsPerAttempt, name, courseIds } = dto;

    await this.databaseService.quiz.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        nQuestionsPerAttempt: nQuestionsPerAttempt,
        courses: {
          deleteMany: {},
          createMany: {
            data: courseIds.map((courseId) => ({
              courseId,
            })),
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.databaseService.quiz.delete({
      where: {
        id: id,
      },
    });
  }
}
