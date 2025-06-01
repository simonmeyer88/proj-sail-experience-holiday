import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { DatabaseModule } from 'src/database/database.module';
import { FileSystemModule } from 'src/file-system/file-system.module';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [DatabaseModule, FileSystemModule],
})
export class CoursesModule {}
