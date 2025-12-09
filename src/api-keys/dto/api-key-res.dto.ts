import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyResponseDto {
  @ApiProperty({
    example: 'sk_live_abcdef123456...',
    description: 'Generated API key',
  })
  api_key: string;

  @ApiProperty({
    example: '2025-01-10T12:00:00Z',
    description: 'Expiration date of the API key',
  })
  expires_at: Date;

  @ApiProperty({
    example: ['deposit', 'transfer', 'read'],
    description: 'Permissions assigned to the key',
  })
  permissions: string[];
}