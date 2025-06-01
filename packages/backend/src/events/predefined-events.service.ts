import { Injectable } from '@nestjs/common';
import { CreatePredefinedEventDto } from './dto/create-predefined-event.dto';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { UpdatePredefinedEventDto } from './dto/update-predefined-event.dto';

@Injectable()
export class PredefinedEventsService {
  constructor(private readonly databaseService: DatabaseService) {}

  public async findAll(where?: Prisma.PredefinedEventWhereInput) {
    return await this.databaseService.predefinedEvent.findMany({
      where,
      orderBy: {
        title: 'asc',
      },
      include: {
        courses: true,
      },
    });
  }

  public async create(createPredefinedEventDto: CreatePredefinedEventDto) {
    const { courseIds, ...rest } = createPredefinedEventDto;
    await this.databaseService.predefinedEvent.create({
      data: {
        ...rest,
        courses: {
          create: courseIds.map((id) => ({
            courseId: id,
          })),
        },
      },
    });
  }

  public async delete(id: string) {
    await this.databaseService.predefinedEvent.delete({
      where: {
        id,
      },
    });
  }

  public async update(
    id: string,
    updatePredefinedEventDto: UpdatePredefinedEventDto,
  ) {
    const { courseIds, ...rest } = updatePredefinedEventDto;
    await this.databaseService.predefinedEvent.update({
      where: {
        id,
      },
      data: {
        ...rest,
        courses: {
          deleteMany: {},
          create: courseIds.map((id) => ({
            courseId: id,
          })),
        },
      },
    });
  }
}
