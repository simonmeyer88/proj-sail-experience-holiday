import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WoocommerceModule } from 'src/woocommerce/woocommerce.module';
@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [WoocommerceModule],
})
export class PaymentsModule {}
