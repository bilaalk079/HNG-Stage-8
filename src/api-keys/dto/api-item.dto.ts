import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyItemDto {
  @ApiProperty({
    example: 'uuid-here',
    description: 'API key ID',
  })
  id: string;

  @ApiProperty({
    example: 'wallet-service',
    description: 'API key name',
  })
  name: string;

  @ApiProperty({
    example: 'sk_live_************************abc123',
    description: 'Masked API key (only last 4 chars visible)',
  })
  key: string;

  @ApiProperty({
    example: ['deposit', 'transfer', 'read'],
    description: 'Permissions assigned to the key',
  })
  permissions: string[];

  @ApiProperty({
    example: '2025-12-10T23:59:59Z',
    description: 'Expiration date',
  })
  expires_at: Date;

  @ApiProperty({
    example: false,
    description: 'Whether the key has been revoked',
  })
  is_revoked: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the key has expired',
  })
  is_expired: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the key is currently active (not revoked and not expired)',
  })
  is_active: boolean;

  @ApiProperty({
    example: '2024-12-09T10:30:00Z',
    description: 'Creation date',
  })
  created_at: Date;
}

export class GetAllKeysResponseDto {
  @ApiProperty({
    type: [ApiKeyItemDto],
    description: 'List of API keys',
  })
  keys: ApiKeyItemDto[];
}