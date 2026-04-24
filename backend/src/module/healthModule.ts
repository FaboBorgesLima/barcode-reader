import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from './prismaModule';
import { HealthController } from '../interface/http/controller/healthController';
import { PrismaHealthIndicator } from '../infra/health/prismaHealthIndicator';

@Module({
  imports: [TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
