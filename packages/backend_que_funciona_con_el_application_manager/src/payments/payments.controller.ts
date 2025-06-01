import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Auth } from 'src/auth/auth.decorator';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // We don't need this cron job anymore
  /*@Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_DAY_AT_4AM
      : CronExpression.EVERY_30_SECONDS,
  )
  public async loadFromStripe(): Promise<void> {
    await this.paymentsService.loadFromStripe();
  }*/

  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_10_HOURS
      : CronExpression.EVERY_30_SECONDS,
  )
  public async loadFromWoocommerce(): Promise<void> {
    await this.paymentsService.loadFromWoocommerce();
  }

  @Auth('ADMIN')
  @Post()
  public async create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<void> {
    await this.paymentsService.create(createPaymentDto);
  }

  @Auth('ADMIN')
  @Delete(':id')
  public async delete(@Param('id') id: string): Promise<void> {
    await this.paymentsService.delete(id);
  }
}
