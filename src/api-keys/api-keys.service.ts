import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../db/schema';
import { randomBytes } from 'crypto';
import { db } from 'src/db';
import { CreateApiKeyDto, RolloverApiKeyDto } from './dto/api-key.dto';

@Injectable()
export class ApiKeysService {
  async createApiKey(userId: string, dto: CreateApiKeyDto) {
    // Check active keys count
    const activeKeys = await db
      .select()
      .from(schema.apiKeys)
      .where(
        and(
          eq(schema.apiKeys.userId, userId),
          eq(schema.apiKeys.isRevoked, false),
          sql`${schema.apiKeys.expiresAt} > NOW()`,
        ),
      );

    if (activeKeys.length >= 5) {
      throw new BadRequestException('Maximum of 5 active API keys allowed');
    }

    const validPermissions = ['deposit', 'transfer', 'read'];
    const invalidPerms = dto.permissions.filter(p => !validPermissions.includes(p));
    if (invalidPerms.length > 0) {
      throw new BadRequestException(`Invalid permissions: ${invalidPerms.join(', ')}`);
    }

    const key = this.generateApiKey();
    const expiresAt = this.calculateExpiry(dto.expiry);

    const [apiKey] = await db
      .insert(schema.apiKeys)
      .values({
        userId,
        name: dto.name,
        key,
        permissions: JSON.stringify(dto.permissions),
        expiresAt,
      })
      .returning();

    return {
      api_key: apiKey.key,
      expires_at: apiKey.expiresAt,
      permissions: dto.permissions,
    };
  }

  async rolloverApiKey(userId: string, dto: RolloverApiKeyDto) {
    const [oldKey] = await db
      .select()
      .from(schema.apiKeys)
      .where(
        and(
          eq(schema.apiKeys.id, dto.expired_key_id),
          eq(schema.apiKeys.userId, userId),
        ),
      );

    if (!oldKey) {
      throw new NotFoundException('API key not found');
    }

    if (new Date(oldKey.expiresAt) >= new Date()) {
      throw new BadRequestException('API key has not expired yet');
    }

    // Check active keys limit
    const activeKeys = await db
      .select()
      .from(schema.apiKeys)
      .where(
        and(
          eq(schema.apiKeys.userId, userId),
          eq(schema.apiKeys.isRevoked, false),
          sql`${schema.apiKeys.expiresAt} > NOW()`,
        ),
      );

    if (activeKeys.length >= 5) {
      throw new BadRequestException('Maximum of 5 active API keys allowed');
    }

    const key = this.generateApiKey();
    const expiresAt = this.calculateExpiry(dto.expiry);
    const permissions = JSON.parse(oldKey.permissions);

    const [newApiKey] = await db
      .insert(schema.apiKeys)
      .values({
        userId,
        name: oldKey.name,
        key,
        permissions: oldKey.permissions,
        expiresAt,
      })
      .returning();

    return {
      api_key: newApiKey.key,
      expires_at: newApiKey.expiresAt,
      permissions,
    };
  }
  async getAllKeys(userId: string) {
  const keys = await db
    .select({
      id: schema.apiKeys.id,
      name: schema.apiKeys.name,
      key: schema.apiKeys.key,
      permissions: schema.apiKeys.permissions,
      expiresAt: schema.apiKeys.expiresAt,
      isRevoked: schema.apiKeys.isRevoked,
      createdAt: schema.apiKeys.createdAt,
    })
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.userId, userId))
    .orderBy(sql`${schema.apiKeys.createdAt} DESC`);

  return keys.map((key) => ({
    id: key.id,
    name: key.name,
    key: this.maskApiKey(key.key), 
    permissions: JSON.parse(key.permissions),
    expires_at: key.expiresAt,
    is_revoked: key.isRevoked,
    is_expired: new Date(key.expiresAt) < new Date(),
    is_active: !key.isRevoked && new Date(key.expiresAt) >= new Date(),
    created_at: key.createdAt,
  }));
}

async revokeKey(userId: string, keyId: string) {
    const [apiKey] = await db
      .select()
      .from(schema.apiKeys)
      .where(
        and(
          eq(schema.apiKeys.id, keyId),
          eq(schema.apiKeys.userId, userId)
        )
      );

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.isRevoked) {
      throw new BadRequestException('API key is already revoked');
    }

    await db
      .update(schema.apiKeys)
      .set({ isRevoked: true, updatedAt: new Date() })
      .where(eq(schema.apiKeys.id, keyId));

    return { status: 'success', message: 'API key revoked successfully' };
  }

  async deleteKey(userId: string, keyId: string) {
    const [apiKey] = await db
      .select()
      .from(schema.apiKeys)
      .where(
        and(
          eq(schema.apiKeys.id, keyId),
          eq(schema.apiKeys.userId, userId)
        )
      );

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await db
      .delete(schema.apiKeys)
      .where(eq(schema.apiKeys.id, keyId));

    return { status: 'success', message: 'API key deleted successfully' };
  }

private maskApiKey(key: string): string {
  if (key.length <= 8) return key;
  const lastFour = key.slice(-4);
  return `sk_live_${'*'.repeat(key.length - 12)}${lastFour}`;
}

  private generateApiKey(): string {
    return 'sk_live_' + randomBytes(32).toString('hex');
  }

  private calculateExpiry(expiry: string): Date {
    const now = new Date();
    switch (expiry) {
      case '1H':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case '1D':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '1M':
        return new Date(now.setMonth(now.getMonth() + 1));
      case '1Y':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        throw new BadRequestException('Invalid expiry format');
    }
  }
}