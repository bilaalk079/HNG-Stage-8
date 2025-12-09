// src/wallet/dto/deposit.dto.ts
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    example: 5000,
    description: 'Amount to deposit (in naira)',
    minimum: 100,
  })
  @IsNumber()
  @Min(100)
  amount: number;
}

export class DepositResponseDto {
  @ApiProperty({
    example: 'TXN_ABC123DEF456...',
    description: 'Unique transaction reference',
  })
  reference: string;

  @ApiProperty({
    example: 'https://checkout.paystack.com/abc123',
    description: 'Paystack payment URL',
  })
  authorization_url: string;

  @ApiProperty({
    example: 'abc123xyz',
    description: 'Paystack access code',
  })
  access_code: string;
}

export class TransferDto {
  @ApiProperty({
    example: '4566678954356789',
    description: 'Recipient wallet number',
  })
  @IsString()
  @IsNotEmpty()
  wallet_number: string;

  @ApiProperty({
    example: 3000,
    description: 'Amount to transfer (in naira)',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;
}

export class TransferResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Transfer completed' })
  message: string;
}

export class BalanceResponseDto {
  @ApiProperty({
    example: 15000,
    description: 'Current wallet balance (in naira)',
  })
  balance: number;
}

export class TransactionDto {
  @ApiProperty({
    example: 'deposit',
    enum: ['deposit', 'transfer'],
  })
  type: string;

  @ApiProperty({ example: 5000 })
  amount: number;

  @ApiProperty({
    example: 'success',
    enum: ['pending', 'success', 'failed'],
  })
  status: string;

  @ApiProperty({
    example: 'TXN_ABC123...',
    nullable: true,
  })
  reference: string | null;

  @ApiProperty({
    example: '2024-12-09T10:30:00Z',
  })
  created_at: Date;
}

export class TransactionsResponseDto {
  @ApiProperty({
    type: [TransactionDto],
    description: 'List of wallet transactions',
  })
  transactions: TransactionDto[];
}


export class WebhookResponseDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 'Webhook processed', required: false })
  message?: string;
}
