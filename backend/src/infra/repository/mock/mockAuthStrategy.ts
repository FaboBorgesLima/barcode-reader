import * as bcrypt from 'bcrypt';
import { AuthStrategy } from '../../../service/authStrategy';

/**
 * Mock auth strategy for CLI/test use.
 * Always uses the fixed OTP "000000" and prints it to stdout
 * instead of sending an email.
 */
export class MockAuthStrategy implements AuthStrategy {
  private pending = new Map<string, string>(); // identity -> bcrypt hash

  async initiate(identity: string): Promise<void> {
    const code = '000000';
    const hashedCode = await bcrypt.hash(code, 10);
    this.pending.set(identity, hashedCode);
    console.log(`[Mock Auth] OTP for "${identity}": ${code}`);
  }

  async verify(identity: string, credential: string): Promise<boolean> {
    const expected = this.pending.get(identity);
    if (!expected) return false;
    return bcrypt.compare(credential, expected);
  }

  async consume(identity: string): Promise<void> {
    this.pending.delete(identity);
  }
}
