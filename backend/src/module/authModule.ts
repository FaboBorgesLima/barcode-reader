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
import type { StringValue } from 'ms';
import { AuthStrategy } from 'src/service/authStrategy';
import {
  AuthStrategyType,
  createAuthStrategy,
} from 'src/factory/authStrategyFactory';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<StringValue>('JWT_EXPIRES_IN', '7d'),
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
      provide: AuthStrategy,
      useFactory: () =>
        createAuthStrategy(
          (process.env.AUTH_STRATEGY as AuthStrategyType) || 'mock',
        ),
    },
    JwtTokenService,
    {
      provide: AuthService,
      useFactory: (
        userRepo: PrismaUserRepository,
        strategy: AuthStrategy,
        token: JwtTokenService,
      ) => new AuthService(userRepo, strategy, token),
      inject: [PrismaUserRepository, AuthStrategy, JwtTokenService],
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
