import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { AuthStrategy } from '../../service/authStrategy';

interface PendingOtp {
  hashedCode: string;
  expiresAt: Date;
}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export class NodemailerOtpAuthStrategy implements AuthStrategy {
  private readonly logger = new Logger(NodemailerOtpAuthStrategy.name);
  private readonly pending = new Map<string, PendingOtp>();
  private readonly transporter: Transporter;
  private readonly from: string;

  public constructor(config: SmtpConfig) {
    this.from = config.from;
    this.transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
  }

  public static fromEnv(): NodemailerOtpAuthStrategy {
    const required = (key: string): string => {
      const val = process.env[key];
      if (!val) throw new Error(`Missing required env variable: ${key}`);
      return val;
    };

    return new NodemailerOtpAuthStrategy({
      host: required('SMTP_HOST'),
      port: Number(process.env['SMTP_PORT'] ?? 587),
      secure: process.env['SMTP_SECURE'] === 'true',
      user: required('SMTP_USER'),
      pass: required('SMTP_PASS'),
      from: process.env['SMTP_FROM'] ?? required('SMTP_USER'),
    });
  }

  public async initiate(identity: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    this.pending.set(identity, { hashedCode, expiresAt });
    this.logger.log(
      `OTP initiated for ${identity}, expires at ${expiresAt.toISOString()}`,
    );

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: identity,
        subject: 'Your login code',
        text: `Your one-time login code is: ${code}\n\nIt expires in 10 minutes.`,
        html: `<p>Your one-time login code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
      });
      this.logger.log(`OTP email sent successfully to ${identity}`);
    } catch (err) {
      this.logger.error(
        `Failed to send OTP email to ${identity}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }
  }

  public async verify(identity: string, credential: string): Promise<boolean> {
    const otp = this.pending.get(identity);
    if (!otp) {
      this.logger.warn(
        `OTP verification failed for ${identity}: no pending OTP found`,
      );
      return false;
    }
    if (otp.expiresAt < new Date()) {
      this.pending.delete(identity);
      this.logger.warn(
        `OTP verification failed for ${identity}: OTP expired at ${otp.expiresAt.toISOString()}`,
      );
      return false;
    }
    const valid = await bcrypt.compare(credential, otp.hashedCode);
    if (valid) {
      this.logger.log(`OTP verification succeeded for ${identity}`);
    } else {
      this.logger.warn(
        `OTP verification failed for ${identity}: invalid credential`,
      );
    }
    return valid;
  }

  public consume(identity: string): Promise<void> {
    this.pending.delete(identity);
    this.logger.debug(`OTP consumed for ${identity}`);
    return Promise.resolve();
  }
}
