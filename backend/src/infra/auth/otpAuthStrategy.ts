import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { Otp } from '../../model/otp';
import { RedisOtpRepository } from '../repository/redisOtpRepository';
import { AuthStrategy } from '../../service/authStrategy';

@Injectable()
export class OtpAuthStrategy implements AuthStrategy {
  private readonly logger = new Logger(OtpAuthStrategy.name);

  constructor(private readonly otpRepository: RedisOtpRepository) {}

  async initiate(identity: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await this.otpRepository.createOtp(
      new Otp(undefined, identity, hashedCode, expiresAt, false),
    );
    this.logger.log(
      `OTP initiated for ${identity}, expires at ${expiresAt.toISOString()}`,
    );
    // In development only — remove/replace with email delivery in production
    this.logger.warn(`[DEV ONLY] OTP code for ${identity}: ${code}`);
  }

  async verify(identity: string, credential: string): Promise<boolean> {
    const otp = await this.otpRepository.getLatestByEmail(identity);
    if (!otp || !otp.isValid()) return false;
    const hashed = crypto.createHash('sha256').update(credential).digest('hex');
    return hashed === otp.hashedCode;
  }

  async consume(identity: string): Promise<void> {
    const otp = await this.otpRepository.getLatestByEmail(identity);
    if (otp?.id) {
      await this.otpRepository.markAsUsed(otp.id);
    }
  }
}
