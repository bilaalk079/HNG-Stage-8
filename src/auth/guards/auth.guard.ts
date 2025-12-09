import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtOrApiKeyGuard extends AuthGuard(['jwt', 'api-key']) {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const hasJwt = request.headers.authorization?.startsWith('Bearer ');
    const hasApiKey = !!request.headers['x-api-key'];

    if (!hasJwt && !hasApiKey) {
      throw new UnauthorizedException('No authentication method provided');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}
