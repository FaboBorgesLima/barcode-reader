import { Module } from '@nestjs/common';
import { PrismaModule } from './prismaModule';
import { AuthModule } from './authModule';
import { PrismaRoomRepository } from '../infra/repository/prismaRoomRepository';
import { RoomService } from '../service/roomService';
import { RoomHttpController } from '../interface/http/controller/roomHttpController';
import { JwtTokenService } from '../infra/auth/jwtTokenService';
import { JwtAuthGuard } from '../infra/auth/jwtAuthGuard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoomHttpController],
  providers: [
    PrismaRoomRepository,
    {
      provide: RoomService,
      useFactory: (repo: PrismaRoomRepository) => new RoomService(repo),
      inject: [PrismaRoomRepository],
    },
    {
      provide: JwtAuthGuard,
      useFactory: (token: JwtTokenService) => new JwtAuthGuard(token),
      inject: [JwtTokenService],
    },
  ],
  exports: [RoomService],
})
export class RoomModule {}
