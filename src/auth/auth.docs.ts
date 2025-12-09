import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginResponseDto, ErrorResponseDto } from './dto/auth-response.dto';

export const AuthDocs = {
  Controller: () => applyDecorators(
    ApiTags('Authentication'),
  ),

  GoogleAuth: () => applyDecorators(
    ApiOperation({
      summary: 'Initiate Google OAuth login',
      description: 'Redirects user to Google OAuth consent screen',
    }),
    ApiResponse({
      status: 302,
      description: 'Redirects to Google OAuth',
    }),
  ),

  GoogleCallback: () => applyDecorators(
    ApiOperation({
      summary: 'Google OAuth callback',
      description: 'Handles Google OAuth callback and returns JWT token. Creates user and wallet if new.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully authenticated',
      type: LoginResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication failed',
      type: ErrorResponseDto,
    }),
  ),
};
