import { Module } from '@nestjs/common';
import { LogSnagService } from './log-snag.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [LogSnagService],
  imports: [HttpModule],
  exports: [LogSnagService],
})
export class LogSnagModule {}
