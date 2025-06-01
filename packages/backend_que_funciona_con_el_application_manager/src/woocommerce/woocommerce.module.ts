import { Module } from '@nestjs/common';
import { WoocommerceService } from './woocommerce.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  providers: [WoocommerceService],
  imports: [HttpModule],
  exports: [WoocommerceService],
})
export class WoocommerceModule {}
