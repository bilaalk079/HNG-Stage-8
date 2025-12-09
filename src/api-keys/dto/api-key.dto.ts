import { IsString, IsArray, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @IsEnum(['1H', '1D', '1M', '1Y'])
  expiry: string;
}

export class RolloverApiKeyDto {
  @IsString()
  @IsNotEmpty()
  expired_key_id: string;

  @IsEnum(['1H', '1D', '1M', '1Y'])
  expiry: string;
}