import { Module } from '@nestjs/common';
import { PrismaModule } from './prismaModule';
import { AuthModule } from './authModule';
import { RoomModule } from './roomModule';
import { PrismaBarcodeRepository } from '../infra/repository/prismaBarcodeRepository';
import { BarcodeService } from '../service/barcodeService';
import { RoomService } from '../service/roomService';
import { BarcodeHttpController } from '../interface/http/controller/barcodeHttpController';
import { JwtTokenService } from '../infra/auth/jwtTokenService';
import { JwtAuthGuard } from '../infra/auth/jwtAuthGuard';

@Module({
  imports: [PrismaModule, AuthModule, RoomModule],
  controllers: [BarcodeHttpController],
  providers: [
    PrismaBarcodeRepository,
    {
      provide: BarcodeService,
      useFactory: (
        barcodeRepo: PrismaBarcodeRepository,
        roomService: RoomService,
      ) => new BarcodeService(barcodeRepo, roomService),
      inject: [PrismaBarcodeRepository, RoomService],
    },
    {
      provide: JwtAuthGuard,
      useFactory: (token: JwtTokenService) => new JwtAuthGuard(token),
      inject: [JwtTokenService],
    },
  ],
})
export class BarcodeModule {}
