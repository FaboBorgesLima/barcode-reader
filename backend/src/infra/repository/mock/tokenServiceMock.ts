import { TokenPayload, TokenService } from '../../../service/tokenService';

export class MockTokenService implements TokenService {
  private revoked = new Set<string>();

  generateToken(payload: TokenPayload): string {
    return `mock::${payload.userId}::${payload.email}`;
  }

  verifyToken(token: string): TokenPayload {
    if (this.revoked.has(token)) throw new Error('Token has been revoked');
    const [prefix, userId, email] = token.split('::');
    if (prefix !== 'mock' || !userId || !email)
      throw new Error('Invalid token');
    return { userId, email };
  }

  revokeToken(token: string): Promise<void> {
    this.revoked.add(token);
    return Promise.resolve();
  }
}
