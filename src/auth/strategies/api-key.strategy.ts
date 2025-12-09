import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from 'src/db';
import { apiKeys } from 'src/db/schema';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  

  async validate(req: Request) {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      throw new UnauthorizedException('API key missing');
    }

    const [key] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, apiKey));

    if (!key) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (key.isRevoked) {
      throw new UnauthorizedException('API key has been revoked');
    }

    if (new Date(key.expiresAt) < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    return {
      userId: key.userId,
      permissions: JSON.parse(key.permissions),
      isApiKey: true,
    };
  }
}