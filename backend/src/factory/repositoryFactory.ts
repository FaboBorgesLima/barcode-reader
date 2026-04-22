import { BarcodeMockRepository } from '../infra/repository/mock/barcodeMockRepository';
import { RoomMockRepository } from '../infra/repository/mock/roomMockRepository';
import { UserMockRepository } from '../infra/repository/mock/userMockRepository';
import { PrismaBarcodeRepository } from '../infra/repository/prismaBarcodeRepository';
import { PrismaRoomRepository } from '../infra/repository/prismaRoomRepository';
import { PrismaUserRepository } from '../infra/repository/prismaUserRepository';
import { PrismaService } from '../infra/prisma/prismaService';
import type { BarcodeRepository } from '../repository/barcodeRepository';
import type { RoomRepository } from '../repository/roomRepository';
import type { UserRepository } from '../repository/userRepository';

export const DB_BACKENDS = ['mock', 'postgres'] as const;
export type DbBackend = (typeof DB_BACKENDS)[number];

export interface Repositories {
  userRepo: UserRepository;
  roomRepo: RoomRepository;
  barcodeRepo: BarcodeRepository;
  /** Defined only when a Prisma connection was opened; call $disconnect() on shutdown. */
  prisma?: PrismaService;
}

export async function createRepositories(db: DbBackend): Promise<Repositories> {
  if (db === 'postgres') {
    const prisma = new PrismaService();
    await prisma.$connect();
    return {
      userRepo: new PrismaUserRepository(prisma),
      roomRepo: new PrismaRoomRepository(prisma),
      barcodeRepo: new PrismaBarcodeRepository(prisma),
      prisma,
    };
  }

  return {
    userRepo: new UserMockRepository(),
    roomRepo: new RoomMockRepository(),
    barcodeRepo: new BarcodeMockRepository(),
  };
}
