import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Otp } from '../../model/otp';
import { OtpRepository } from '../../repository/otpRepository';

interface StoredOtp {
  hashedCode: string;
  expiresAt: string;
  used: boolean;
}

@Injectable()
export class RedisOtpRepository implements OtpRepository {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache & { del(key: string): Promise<void> },
  ) {}

  private key(email: string): string {
    return `otp:${email}`;
  }

  async createOtp(otp: Otp): Promise<Otp> {
    const ttlMs = otp.expiresAt.getTime() - Date.now();
    const data: StoredOtp = {
      hashedCode: otp.hashedCode,
      expiresAt: otp.expiresAt.toISOString(),
      used: false,
    };
    await this.cache.set(this.key(otp.email), data, ttlMs);
    // Use email as id so markAsUsed can resolve the key
    return new Otp(otp.email, otp.email, otp.hashedCode, otp.expiresAt, false);
  }

  async getLatestByEmail(email: string): Promise<Otp | null> {
    const data = await this.cache.get<StoredOtp>(this.key(email));
    if (!data) return null;
    return new Otp(
      email,
      email,
      data.hashedCode,
      new Date(data.expiresAt),
      data.used,
    );
  }

  async markAsUsed(id: string): Promise<void> {
    // id is the email for Redis-backed OTPs — deleting the key invalidates it
    await this.cache.del(this.key(id));
  }
}
