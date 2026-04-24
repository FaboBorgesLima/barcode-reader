import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './module/prismaModule';
import { AuthModule } from './module/authModule';
import { UserModule } from './module/userModule';
import { RoomModule } from './module/roomModule';
import { BarcodeModule } from './module/barcodeModule';
import { HealthModule } from './module/healthModule';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    RoomModule,
    BarcodeModule,
    HealthModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [new KeyvRedis(process.env.REDIS_URL)],
      }),
    }),
  ],
})
export class AppModule {}
