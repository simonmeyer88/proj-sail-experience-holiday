import { Module } from '@nestjs/common';
import { ZoomService } from './zoom.service';
import { ZoomController } from './zoom.controller';

@Module({
  controllers: [ZoomController],
  providers: [ZoomService],
})
export class ZoomModule {}
