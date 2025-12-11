import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../auth/dto/auth-response.dto';
import { ApiKeyResponseDto } from './dto/api-key-res.dto';
import { ApiKeyItemDto } from './dto/api-item.dto';

export const ApiKeysDocs = {
  Controller: () => applyDecorators(
    ApiTags('API Keys'),
    ApiBearerAuth(),
  ),

  CreateApiKey: () => applyDecorators(
    ApiOperation({
      summary: 'Create a new API key',
      description: 'Creates a new API key with specified permissions. Maximum 5 active keys per user.',
    }),
    ApiResponse({
      status: 201,
      description: 'API key created successfully',
      type: ApiKeyResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid input or maximum keys limit reached',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'JWT token missing or invalid',
      type: ErrorResponseDto,
    }),
  ),

  RolloverApiKey: () => applyDecorators(
    ApiOperation({
      summary: 'Rollover an expired API key',
      description: 'Creates a new API key using the same permissions as an expired key',
    }),
    ApiResponse({
      status: 201,
      description: 'API key rolled over successfully',
      type: ApiKeyResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Key not expired or maximum keys limit reached',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'API key not found',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'JWT token missing or invalid',
      type: ErrorResponseDto,
    }),
  ),
  GetAllKeys: () => applyDecorators(
  ApiOperation({
    summary: 'Get all API keys',
    description: 'Retrieve all API keys for the authenticated user. Keys are masked for security (only last 4 characters visible).',
  }),
  ApiResponse({
    status: 200,
    description: 'API keys retrieved successfully',
    type: [ApiKeyItemDto], 
  }),
  ApiUnauthorizedResponse({
    description: 'JWT token missing or invalid',
    type: ErrorResponseDto,
  }),
),
RevokeApiKey: () => applyDecorators(
    ApiOperation({
      summary: 'Revoke an API key',
      description: 'Revokes a key. The key will no longer be valid for authentication.',
    }),
    ApiParam({ name: 'id', description: 'API key ID to revoke' }),
    ApiResponse({
      status: 200,
      description: 'API key revoked successfully',
    }),
    ApiNotFoundResponse({
      description: 'API key not found',
      type: ErrorResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'API key is already revoked',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'JWT token missing or invalid',
      type: ErrorResponseDto,
    }),
  ),

  DeleteApiKey: () => applyDecorators(
    ApiOperation({
      summary: 'Delete an API key permanently',
      description: 'Deletes an API key. This action is irreversible.',
    }),
    ApiParam({ name: 'id', description: 'API key ID to delete' }),
    ApiResponse({
      status: 200,
      description: 'API key deleted successfully',
    }),
    ApiNotFoundResponse({
      description: 'API key not found',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'JWT token missing or invalid',
      type: ErrorResponseDto,
    }),
  ),
};