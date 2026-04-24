import { Module } from '@nestjs/common';
import { PrismaModule } from './prismaModule';
import { AuthModule } from './authModule';
import { PrismaUserRepository } from '../infra/repository/prismaUserRepository';
import { UserService } from '../service/userSerivice';
import { UserHttpController } from '../interface/http/controller/userHttpController';
import { JwtTokenService } from '../infra/auth/jwtTokenService';
import { JwtAuthGuard } from '../infra/auth/jwtAuthGuard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserHttpController],
  providers: [
    PrismaUserRepository,
    {
      provide: UserService,
      useFactory: (repo: PrismaUserRepository) => new UserService(repo),
      inject: [PrismaUserRepository],
    },
    {
      provide: JwtAuthGuard,
      useFactory: (token: JwtTokenService) => new JwtAuthGuard(token),
      inject: [JwtTokenService],
    },
  ],
})
export class UserModule {}
