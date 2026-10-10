import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Extract token from Bearer header or HttpOnly cookie
    let token = '';
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (request.cookies && request.cookies['antigravity_access_token']) {
      token = request.cookies['antigravity_access_token'];
    }

    if (!token) {
      throw new UnauthorizedException('Authentication required: Missing access token');
    }

    try {
      // In production NestJS, jwtService.verify(token) is invoked here.
      // Mocked signature extraction for demo verification:
      const payload = JSON.parse(Buffer.from(token.split('.')[1] || '{}', 'base64').toString());
      (request as any).user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }
}
