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
  @Req() req: any,
  @Headers('x-paystack-signature') signature: string,
  @Body() body: any,
): Promise<WebhookResponseDto> {
  if (!signature) {
    throw new BadRequestException('Missing signature');
  }
  let rawBody: string;
  let payload: any;

  try {
    if (req.rawBody) {
      rawBody = typeof req.rawBody === 'string' ? req.rawBody : req.rawBody.toString('utf8');
      payload = JSON.parse(rawBody);
    } else if (typeof body === 'string') {
      rawBody = body;
      payload = JSON.parse(body);
    } else if (typeof body === 'object' && body !== null) {
      payload = body;
      rawBody = JSON.stringify(body);
    } else {
      throw new BadRequestException('Invalid webhook body format');
    }
    const isValid = this.paystackService.verifyWebhookSignature(rawBody, signature);
    
    if (!isValid) {
      throw new BadRequestException('Invalid signature');
    }
    await this.walletService.handleWebhook(payload);
    return { status: true };
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException('Failed to process webhook');
  }
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
