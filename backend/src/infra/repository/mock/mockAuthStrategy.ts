import { createHash } from 'node:crypto';
import { AuthStrategy } from '../../../service/authStrategy';

/**
 * Mock auth strategy for CLI testing.
 * Always uses the fixed OTP "000000" and prints it to stdout
 * instead of sending an email.
 */
export class MockAuthStrategy implements AuthStrategy {
  private pending = new Map<string, string>(); // identity -> hashedCode

  async initiate(identity: string): Promise<void> {
    const code = '000000';
    const hashedCode = createHash('sha256').update(code).digest('hex');
    this.pending.set(identity, hashedCode);
    console.log(`[Mock Auth] OTP for "${identity}": ${code}`);
  }

  async verify(identity: string, credential: string): Promise<boolean> {
    const expected = this.pending.get(identity);
    if (!expected) return false;
    const hashedInput = createHash('sha256').update(credential).digest('hex');
    return hashedInput === expected;
  }

  async consume(identity: string): Promise<void> {
    this.pending.delete(identity);
  }
}
