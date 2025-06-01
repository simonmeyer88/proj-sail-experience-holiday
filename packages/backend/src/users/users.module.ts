import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { UsersController } from './users.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  imports: [DatabaseModule, StorageModule],
  controllers: [UsersController],
})
export class UsersModule {}
