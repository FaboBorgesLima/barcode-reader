import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Request } from 'express';

const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

@Injectable()
export class EmailRateLimiterGuard implements CanActivate {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const email: string | undefined = req.body?.email;

    // Let the validation layer handle missing/invalid email
    if (!email || typeof email !== 'string') return true;

    const key = `rate:otp:${email.toLowerCase()}`;
    const now = Date.now();
    const stored = await this.cache.get<RateLimitEntry>(key);

    if (!stored || now - stored.windowStart >= WINDOW_MS) {
      await this.cache.set(key, { count: 1, windowStart: now }, WINDOW_MS);
      return true;
    }

    if (stored.count >= MAX_REQUESTS) {
      const retryAfterSec = Math.ceil(
        (WINDOW_MS - (now - stored.windowStart)) / 1000,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many OTP requests. Please try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
        { cause: { retryAfterSec } },
      );
    }

    await this.cache.set(
      key,
      { count: stored.count + 1, windowStart: stored.windowStart },
      WINDOW_MS,
    );
    return true;
  }
}
