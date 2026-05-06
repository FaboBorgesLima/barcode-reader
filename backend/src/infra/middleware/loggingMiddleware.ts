import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, _res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const body: unknown = req.body;
    this.logger.log(
      `${method} ${originalUrl} - IP: ${ip} - Body: ${JSON.stringify(body)}`,
    );
    next();
  }
}
