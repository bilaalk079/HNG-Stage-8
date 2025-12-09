import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PaystackService } from './paystack.service';

@Module({
  imports: [HttpModule],
  controllers: [WalletController],
  providers: [WalletService, PaystackService],
})
export class WalletModule {}