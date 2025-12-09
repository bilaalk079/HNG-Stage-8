import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { createHmac } from 'crypto';

@Injectable()
export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY')!;
  }

  async initializeTransaction(email: string, amount: number, reference: string) {
    const url = `${this.baseUrl}/transaction/initialize`;
    const response : any= await firstValueFrom(
      this.httpService.post(
        url,
        {
          email,
          amount: amount * 100, 
          reference,
          callback_url: `${this.configService.get('APP_URL')}/wallet/payment/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    return response.data;
  }

  async verifyTransaction(reference: string) {
    const url = `${this.baseUrl}/transaction/verify/${reference}`;
    const response: any = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      }),
    );
    return response.data;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = createHmac('sha512', this.secretKey).update(payload).digest('hex');
    return hash === signature;
  }
}