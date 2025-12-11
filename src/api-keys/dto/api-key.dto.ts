import { IsString, IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Name for the API key',
    example: 'wallet-service',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Permissions assigned to this API key',
    example: ['deposit', 'transfer', 'read'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty({
    description: 'Expiry period for the API key',
    example: '1D',
    enum: ['1H', '1D', '1M', '1Y'],
  })
  @IsEnum(['1H', '1D', '1M', '1Y'])
  expiry: string;
}

export class RolloverApiKeyDto {
  @ApiProperty({
    description: 'The ID of the expired API key to rollover',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsString()
  @IsNotEmpty()
  expired_key_id: string;

  @ApiProperty({
    description: 'New expiry period for the rolled-over API key',
    example: '1M',
    enum: ['1H', '1D', '1M', '1Y'],
  })
  @IsEnum(['1H', '1D', '1M', '1Y'])
  expiry: string;
}
