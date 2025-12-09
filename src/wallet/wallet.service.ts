import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../db/schema';
import { PaystackService } from './paystack.service';
import { randomBytes } from 'crypto';
import { db } from 'src/db';
import { DepositDto, TransferDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    private paystackService: PaystackService,
  ) {}

  async initiateDeposit(userId: string, dto: DepositDto, userEmail: string) {
    const [wallet] = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, userId));

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const reference = this.generateReference();

    // Create pending transaction
    await db.insert(schema.transactions).values({
      walletId: wallet.id,
      type: 'deposit',
      amount: dto.amount.toString(),
      status: 'pending',
      reference,
    });

    const paystackResponse = await this.paystackService.initializeTransaction(
      userEmail,
      dto.amount,
      reference,
    );

    return {
      reference,
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code,
    };
  }

  async handleWebhook(payload: any) {
    const { event, data } = payload;

    if (event === 'charge.success') {
      const reference = data.reference;
      const amount = data.amount / 100; // Convert from kobo

      // Find transaction
      const [transaction] = await 
db
        .select()
        .from(schema.transactions)
        .where(eq(schema.transactions.reference, reference));

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Prevent double crediting
      if (transaction.status === 'success') {
        return { status: true, message: 'Already processed' };
      }

      // Update transaction and wallet in a transaction
      await 
db.transaction(async (tx) => {
        // Update transaction status
        await tx
          .update(schema.transactions)
          .set({ status: 'success', updatedAt: new Date() })
          .where(eq(schema.transactions.id, transaction.id));

        // Credit wallet
        await tx
          .update(schema.wallets)
          .set({
            balance: sql`${schema.wallets.balance} + ${amount}`,
            updatedAt: new Date(),
          })
          .where(eq(schema.wallets.id, transaction.walletId));
      });

      return { status: true };
    }

    if (event === 'charge.failed') {
      const reference = data.reference;
      await 
db
        .update(schema.transactions)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(schema.transactions.reference, reference));
    }

    return { status: true };
  }

  async getDepositStatus(reference: string, userId: string) {
    const [transaction] = await db
      .select({
        id: schema.transactions.id,
        reference: schema.transactions.reference,
        status: schema.transactions.status,
        amount: schema.transactions.amount,
        walletId: schema.transactions.walletId,
        wallet: {
          userId: schema.wallets.userId,
        },
      })
      .from(schema.transactions)
      .innerJoin(schema.wallets, eq(schema.transactions.walletId, schema.wallets.id))
      .where(eq(schema.transactions.reference, reference));

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.wallet.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    return {
      reference: transaction.reference,
      status: transaction.status,
      amount: parseFloat(transaction.amount),
    };
  }

  async getBalance(userId: string) {
    const [wallet] = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, userId));

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return { balance: parseFloat(wallet.balance) };
  }

  async transfer(userId: string, dto: TransferDto) {
    return await db.transaction(async (tx) => {
      // Get sender wallet
      const [senderWallet] = await tx
        .select()
        .from(schema.wallets)
        .where(eq(schema.wallets.userId, userId))
        .for('update');

      if (!senderWallet) {
        throw new NotFoundException('Sender wallet not found');
      }

      // Check balance
      if (parseFloat(senderWallet.balance) < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Get recipient wallet
      const [recipientWallet] = await tx
        .select()
        .from(schema.wallets)
        .where(eq(schema.wallets.walletNumber, dto.wallet_number))
        .for('update');

      if (!recipientWallet) {
        throw new NotFoundException('Recipient wallet not found');
      }

      if (senderWallet.id === recipientWallet.id) {
        throw new BadRequestException('Cannot transfer to same wallet');
      }

      // Deduct from sender
      await tx
        .update(schema.wallets)
        .set({
          balance: sql`${schema.wallets.balance} - ${dto.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.wallets.id, senderWallet.id));

      // Add to recipient
      await tx
        .update(schema.wallets)
        .set({
          balance: sql`${schema.wallets.balance} + ${dto.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.wallets.id, recipientWallet.id));

      // Record transaction for sender
      await tx.insert(schema.transactions).values({
        walletId: senderWallet.id,
        type: 'transfer',
        amount: dto.amount.toString(),
        status: 'success',
        recipientWalletId: recipientWallet.id,
        reference: this.generateReference(),
      });

      // Record transaction for recipient
      await tx.insert(schema.transactions).values({
        walletId: recipientWallet.id,
        type: 'transfer',
        amount: dto.amount.toString(),
        status: 'success',
        recipientWalletId: senderWallet.id,
        reference: this.generateReference(),
      });

      return {
        status: 'success',
        message: 'Transfer completed',
      };
    });
  }

  async getTransactions(userId: string) {
    const [wallet] = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, userId));

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const transactions = await db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.walletId, wallet.id))
      .orderBy(sql`${schema.transactions.createdAt} DESC`);

    return transactions.map((t) => ({
      type: t.type,
      amount: parseFloat(t.amount),
      status: t.status,
      reference: t.reference,
      created_at: t.createdAt,
    }));
  }

  private generateReference(): string {
    return 'TXN_' + randomBytes(16).toString('hex').toUpperCase();
  }
}