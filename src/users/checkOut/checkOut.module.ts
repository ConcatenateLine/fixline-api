import { Module } from '@nestjs/common';
import { CheckOutService } from 'src/users/checkOut/checkOut.service';
import { CheckOutResolver } from 'src/users/checkOut/checkOut.resolver';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [PaymentModule],
  providers: [CheckOutService, CheckOutResolver],
  exports: [CheckOutService],
})
export class CheckOutModule {}
