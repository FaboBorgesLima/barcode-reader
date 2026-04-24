import { Module } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prismaService';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
