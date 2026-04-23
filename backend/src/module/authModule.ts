import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prismaModule';
import { RedisOtpRepository } from '../infra/repository/redisOtpRepository';
import { OtpAuthStrategy } from '../infra/auth/otpAuthStrategy';
import { JwtTokenService } from '../infra/auth/jwtTokenService';
import { PrismaUserRepository } from '../infra/repository/prismaUserRepository';
import { AuthService } from '../service/authService';
import { AuthHttpController } from '../interface/http/controller/authHttpController';
import { JwtAuthGuard } from '../infra/auth/jwtAuthGuard';
import { EmailRateLimiterGuard } from '../infra/auth/emailRateLimiterGuard';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthHttpController],
  providers: [
    RedisOtpRepository,
    { provide: 'OtpRepository', useExisting: RedisOtpRepository },
    PrismaUserRepository,
    { provide: 'UserRepository', useExisting: PrismaUserRepository },
    {
      provide: OtpAuthStrategy,
      useFactory: (otpRepo: RedisOtpRepository) => new OtpAuthStrategy(otpRepo),
      inject: [RedisOtpRepository],
    },
    JwtTokenService,
    {
      provide: AuthService,
      useFactory: (
        userRepo: PrismaUserRepository,
        strategy: OtpAuthStrategy,
        token: JwtTokenService,
      ) => new AuthService(userRepo, strategy, token),
      inject: [PrismaUserRepository, OtpAuthStrategy, JwtTokenService],
    },
    {
      provide: JwtAuthGuard,
      useFactory: (token: JwtTokenService) => new JwtAuthGuard(token),
      inject: [JwtTokenService],
    },
    EmailRateLimiterGuard,
  ],
  exports: [JwtTokenService, JwtAuthGuard],
})
export class AuthModule {}
