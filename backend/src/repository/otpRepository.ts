import { Otp } from '../model/otp';

export interface OtpRepository {
  createOtp(otp: Otp): Promise<Otp>;
  getLatestByEmail(email: string): Promise<Otp | null>;
  markAsUsed(id: string): Promise<void>;
}
