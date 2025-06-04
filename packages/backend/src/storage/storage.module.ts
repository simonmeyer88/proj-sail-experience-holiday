import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { LocalStorageService } from './local-storage.service';

@Global()
@Module({
  providers: [StorageService, LocalStorageService],
  exports: [StorageService, LocalStorageService],
})
export class StorageModule {}
