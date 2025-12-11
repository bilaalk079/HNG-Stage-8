// src/wallet/wallet.controller.ts (FIXED)
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  RawBodyRequest,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PaystackService } from './paystack.service';
import {
  DepositDto,
  TransferDto,
  DepositResponseDto,
  TransferResponseDto,
  BalanceResponseDto,
  WebhookResponseDto,
  TransactionDto,
} from './dto/wallet.dto';
import { RequirePermission } from 'src/auth/decorators/auth.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { WalletDocs } from './wallet.doc';

@Controller('wallet')
@WalletDocs.Controller()
export class WalletController {
  constructor(
    private walletService: WalletService,
    private paystackService: PaystackService,
  ) {}

  @Post('deposit')
  @UseGuards(JwtOrApiKeyGuard, PermissionGuard) // CORRECT ORDER: Auth first, then permission
  @RequirePermission('deposit')
  @WalletDocs.Deposit()
  async deposit(
    @Req() req,
    @Body() dto: DepositDto,
  ): Promise<DepositResponseDto> {
    return this.walletService.initiateDeposit(
      req.user.userId,
      dto,
      req.user.email,
    );
  }

@Post('paystack/webhook')
@WalletDocs.PaystackWebhook()
async handleWebhook(
  @Req() req: RawBodyRequest<Request>,
  @Headers('x-paystack-signature') signature: string,
): Promise<WebhookResponseDto> {
  if (!signature) {
    throw new BadRequestException('Missing signature');
  }

  const rawBody = (req as any).rawBody.toString();
  const isValid = this.paystackService.verifyWebhookSignature(rawBody, signature);

  if (!isValid) {
    throw new BadRequestException('Invalid signature');
  }

  const payload = JSON.parse(rawBody);
  await this.walletService.handleWebhook(payload);
  return { status: true };
}

  @Get('deposit/:reference/status')
  @UseGuards(JwtOrApiKeyGuard)
  @WalletDocs.GetDepositStatus()
  async getDepositStatus(@Req() req, @Param('reference') reference: string) {
    return this.walletService.getDepositStatus(reference, req.user.userId);
  }

  @Get('balance')
  @UseGuards(JwtOrApiKeyGuard, PermissionGuard)
  @RequirePermission('read')
  @WalletDocs.GetBalance()
  async getBalance(@Req() req): Promise<BalanceResponseDto> {
    return this.walletService.getBalance(req.user.userId);
  }

  @Post('transfer')
  @UseGuards(JwtOrApiKeyGuard, PermissionGuard)
  @RequirePermission('transfer')
  @WalletDocs.Transfer()
  async transfer(
    @Req() req,
    @Body() dto: TransferDto,
  ): Promise<TransferResponseDto> {
    return this.walletService.transfer(req.user.userId, dto);
  }

  @Get('transactions')
  @UseGuards(JwtOrApiKeyGuard, PermissionGuard)
  @RequirePermission('read')
  @WalletDocs.GetTransactions()
  async getTransactions(@Req() req): Promise<TransactionDto[]> {
    return this.walletService.getTransactions(req.user.userId);
  }
}
