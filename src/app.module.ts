import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { WalletModule } from './wallet/wallet.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ApiKeysModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule {}