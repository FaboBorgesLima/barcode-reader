import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload, TokenService } from '../../service/tokenService';

@Injectable()
export class JwtTokenService implements TokenService {
    private readonly revoked = new Set<string>();

    constructor(private readonly jwtService: JwtService) {}

    generateToken(payload: TokenPayload): string {
        return this.jwtService.sign(payload);
    }

    verifyToken(token: string): TokenPayload {
        if (this.revoked.has(token)) {
            throw new UnauthorizedException('Token has been revoked');
        }
        try {
            return this.jwtService.verify<TokenPayload>(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async revokeToken(token: string): Promise<void> {
        this.revoked.add(token);
    }
}
