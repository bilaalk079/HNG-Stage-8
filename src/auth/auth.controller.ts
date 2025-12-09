import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDocs } from './auth.docs';

@Controller('auth')
@AuthDocs.Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @AuthDocs.GoogleAuth()
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @AuthDocs.GoogleCallback()
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    return res.json(result);
  }
}