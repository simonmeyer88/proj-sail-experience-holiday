import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [VideosController],
  providers: [VideosService],
  imports: [DatabaseModule],
})
export class VideosModule {}
