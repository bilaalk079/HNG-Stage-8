import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysDocs } from './api-key.doc';
import { CreateApiKeyDto, RolloverApiKeyDto } from './dto/api-key.dto';
import { ApiKeyItemDto } from './dto/api-item.dto';

@Controller('keys')
@UseGuards(AuthGuard('jwt'))
@ApiKeysDocs.Controller()
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post('create')
  @ApiKeysDocs.CreateApiKey()
  async createApiKey(@Req() req, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.createApiKey(req.user.userId, dto);
  }

  @Post('rollover')
  @ApiKeysDocs.RolloverApiKey()
  async rolloverApiKey(@Req() req, @Body() dto: RolloverApiKeyDto) {
    return this.apiKeysService.rolloverApiKey(req.user.userId, dto);
  }
  @Get()
  @ApiKeysDocs.GetAllKeys()
  async getAllKeys(@Req() req): Promise<ApiKeyItemDto[]> {
    return this.apiKeysService.getAllKeys(req.user.userId);
  }
}