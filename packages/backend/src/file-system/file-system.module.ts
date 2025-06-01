import { Module } from '@nestjs/common';
import { FileSystemService } from './file-system.service';
import { FileSystemController } from './file-system.controller';

@Module({
  controllers: [FileSystemController],
  providers: [FileSystemService],
  exports: [FileSystemService],
})
export class FileSystemModule {}
