import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { UsersModule } from 'src/users/users.module';
import { EmailEventHandler } from './email.event-handler';

@Global()
@Module({
  providers: [EmailService, EmailEventHandler],
  exports: [EmailService],
  imports: [UsersModule],
})
export class EmailModule {}
