import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { db } from 'src/db';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

async validateGoogleUser(profile: any) {
  const { id, emails, displayName } = profile;
  const email = emails[0].value;

  let [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.googleId, id));

  if (!user) {
    [user] = await db
      .insert(schema.users)
      .values({
        googleId: id,
        email,
        name: displayName,
      })
      .returning();

    // Create wallet for new user
    const walletNumber = this.generateWalletNumber();
    await db.insert(schema.wallets).values({
      userId: user.id,
      walletNumber,
      balance: '0.00',
    });
  }

  // Return a normalized object compatible with your guards
  return {
    userId: user.id,
    id: user.id,
    email: user.email,
    name: user.name,
    isApiKey: false,        // required by PermissionGuard
    permissions: [],        // Google users don’t have API key permissions
  };
}


 async login(user: any) {
  const payload = {
    email: user.email,
    sub: user.id,
    userId: user.id,
    isApiKey: false,          // JWT users are not API keys
    permissions: user.permissions || [],
  };

  return {
    access_token: this.jwtService.sign(payload),
    user: {
      userId: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      isApiKey: false,
      permissions: user.permissions || [],
    },
  };
}

  private generateWalletNumber(): string {
    return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
  }
}