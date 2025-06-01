import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { UsersOnEventsService } from './users-events.service';
import { PredefinedEventsService } from './predefined-events.service';
import { UsersModule } from 'src/users/users.module';
import { WoocommerceService } from '../woocommerce/woocommerce.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    UsersOnEventsService,
    PredefinedEventsService,
    WoocommerceService,
  ],
  imports: [UsersModule, HttpModule],
})
export class EventsModule {}
