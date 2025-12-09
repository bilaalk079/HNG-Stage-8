// src/wallet/wallet.docs.ts
import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import {
  DepositResponseDto,
  TransferResponseDto,
  BalanceResponseDto,
  TransactionsResponseDto,
  WebhookResponseDto,
} from './dto/wallet.dto';
import { ErrorResponseDto } from '../auth/dto/auth-response.dto';

export const WalletDocs = {
  Controller: () => applyDecorators(
    ApiTags('Wallet'),
  ),

  Deposit: () => applyDecorators(
    ApiOperation({
      summary: 'Initiate wallet deposit',
      description: 'Initialize a Paystack transaction for wallet deposit. Returns payment URL.',
    }),
    ApiBearerAuth(),
    ApiHeader({
      name: 'x-api-key',
      description: 'API key (alternative to JWT)',
      required: false,
    }),
    ApiResponse({
      status: 201,
      description: 'Deposit initiated successfully',
      type: DepositResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid amount or insufficient permissions',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'No valid authentication provided',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'API key lacks deposit permission',
      type: ErrorResponseDto,
    }),
  ),

  PaystackWebhook: () => applyDecorators(
    ApiOperation({
      summary: 'Paystack webhook handler',
      description: 'Receives payment notifications from Paystack. Credits wallet on successful payment. CRITICAL: This is the ONLY way wallets are credited.',
    }),
    ApiHeader({
      name: 'x-paystack-signature',
      description: 'Paystack webhook signature for verification',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Webhook processed successfully',
      type: WebhookResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid signature or missing data',
      type: ErrorResponseDto,
    }),
  ),

  GetDepositStatus: () => applyDecorators(
    ApiOperation({
      summary: 'Check deposit transaction status',
      description: 'Get the status of a deposit transaction. Note: This does NOT credit wallets, only the webhook does.',
    }),
    ApiBearerAuth(),
    ApiHeader({
      name: 'x-api-key',
      description: 'API key (alternative to JWT)',
      required: false,
    }),
    ApiParam({
      name: 'reference',
      description: 'Transaction reference',
      example: 'TXN_ABC123...',
    }),
    ApiResponse({
      status: 200,
      description: 'Transaction status retrieved',
    }),
    ApiNotFoundResponse({
      description: 'Transaction not found',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'No valid authentication provided',
      type: ErrorResponseDto,
    }),
  ),

  GetBalance: () => applyDecorators(
    ApiOperation({
      summary: 'Get wallet balance',
      description: 'Retrieve current wallet balance',
    }),
    ApiBearerAuth(),
    ApiHeader({
      name: 'x-api-key',
      description: 'API key (alternative to JWT)',
      required: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Balance retrieved successfully',
      type: BalanceResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'No valid authentication provided',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'API key lacks read permission',
      type: ErrorResponseDto,
    }),
  ),

  Transfer: () => applyDecorators(
    ApiOperation({
      summary: 'Transfer money to another wallet',
      description: 'Send money from your wallet to another user\'s wallet. Transaction is atomic.',
    }),
    ApiBearerAuth(),
    ApiHeader({
      name: 'x-api-key',
      description: 'API key (alternative to JWT)',
      required: false,
    }),
    ApiResponse({
      status: 201,
      description: 'Transfer completed successfully',
      type: TransferResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Insufficient balance, invalid wallet, or same wallet transfer',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Recipient wallet not found',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'No valid authentication provided',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'API key lacks transfer permission',
      type: ErrorResponseDto,
    }),
  ),

  GetTransactions: () => applyDecorators(
    ApiOperation({
      summary: 'Get transaction history',
      description: 'Retrieve all wallet transactions (deposits and transfers)',
    }),
    ApiBearerAuth(),
    ApiHeader({
      name: 'x-api-key',
      description: 'API key (alternative to JWT)',
      required: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Transactions retrieved successfully',
      type: [TransactionsResponseDto],
    }),
    ApiUnauthorizedResponse({
      description: 'No valid authentication provided',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'API key lacks read permission',
      type: ErrorResponseDto,
    }),
  ),
};