import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenService } from './jwtTokenService';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly tokenService: JwtTokenService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers['authorization'];
        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing Bearer token');
        }
        const token = authHeader.slice(7);
        try {
            const payload = this.tokenService.verifyToken(token);
            (request as any).user = payload;
            (request as any).token = token;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
