import { Injectable } from '@nestjs/common';
import { Otp } from '../../model/otp';
import { OtpRepository } from '../../repository/otpRepository';
import { PrismaService } from '../prisma/prismaService';

@Injectable()
export class PrismaOtpRepository implements OtpRepository {
    constructor(private readonly prisma: PrismaService) {}

    private map(row: { id: string; email: string; hashedCode: string; expiresAt: Date; used: boolean }): Otp {
        return new Otp(row.id, row.email, row.hashedCode, row.expiresAt, row.used);
    }

    async createOtp(otp: Otp): Promise<Otp> {
        const row = await this.prisma.otp.create({
            data: {
                email: otp.email,
                hashedCode: otp.hashedCode,
                expiresAt: otp.expiresAt,
                used: otp.used,
            },
        });
        return this.map(row);
    }

    async getLatestByEmail(email: string): Promise<Otp | null> {
        const row = await this.prisma.otp.findFirst({
            where: { email },
            orderBy: { expiresAt: 'desc' },
        });
        return row ? this.map(row) : null;
    }

    async markAsUsed(id: string): Promise<void> {
        await this.prisma.otp.update({ where: { id }, data: { used: true } });
    }
}
