import 'reflect-metadata';
import { MockAuthStrategy } from './infra/repository/mock/mockAuthStrategy';
import { BarcodeMockRepository } from './infra/repository/mock/barcodeMockRepository';
import { RoomMockRepository } from './infra/repository/mock/roomMockRepository';
import { MockTokenService } from './infra/repository/mock/tokenServiceMock';
import { UserMockRepository } from './infra/repository/mock/userMockRepository';
import { PrismaService } from './infra/prisma/prismaService';
import { PrismaBarcodeRepository } from './infra/repository/prismaBarcodeRepository';
import { PrismaRoomRepository } from './infra/repository/prismaRoomRepository';
import { PrismaUserRepository } from './infra/repository/prismaUserRepository';
import { AuthController } from './interface/cli/controller/authController';
import { BarcodeController } from './interface/cli/controller/barcodeController';
import { RoomController } from './interface/cli/controller/roomController';
import { UserController } from './interface/cli/controller/userController';
import { Router } from './interface/cli/router';
import { AuthView } from './interface/cli/view/authView';
import { BarcodeView } from './interface/cli/view/barcodeView';
import { RoomView } from './interface/cli/view/roomView';
import { UserView } from './interface/cli/view/userView';
import { AuthService } from './service/authService';
import { BarcodeService } from './service/barcodeService';
import { RoomService } from './service/roomService';
import { UserService } from './service/userSerivice';
import type { UserRepository } from './repository/userRepository';
import type { RoomRepository } from './repository/roomRepository';
import type { BarcodeRepository } from './repository/barcodeRepository';

const VALID_DBS = ['mock', 'postgres'] as const;
type DbBackend = (typeof VALID_DBS)[number];

const dbArg = process.argv.find((a) => a.startsWith('--db='));
const db = (dbArg ? dbArg.split('=')[1] : 'mock') as DbBackend;

if (!VALID_DBS.includes(db)) {
  console.error(
    `Invalid --db value "${db}". Valid options: ${VALID_DBS.join(', ')}`,
  );
  process.exit(1);
}

(async () => {
  let userRepo: UserRepository;
  let roomRepo: RoomRepository;
  let barcodeRepo: BarcodeRepository;
  let prisma: PrismaService | undefined;

  if (db === 'postgres') {
    prisma = new PrismaService();
    await prisma.$connect();
    userRepo = new PrismaUserRepository(prisma);
    roomRepo = new PrismaRoomRepository(prisma);
    barcodeRepo = new PrismaBarcodeRepository(prisma);
    console.log('[DB] Connected to PostgreSQL');
  } else {
    userRepo = new UserMockRepository();
    roomRepo = new RoomMockRepository();
    barcodeRepo = new BarcodeMockRepository();
    console.log('[DB] Using in-memory mock');
  }

  // Auth / token always use mock in CLI mode
  const authStrategy = new MockAuthStrategy();
  const tokenService = new MockTokenService();

  // Domain services
  const authService = new AuthService(userRepo, authStrategy, tokenService);
  const userService = new UserService(userRepo);
  const roomService = new RoomService(roomRepo);
  const barcodeService = new BarcodeService(barcodeRepo, roomService);

  // Views
  const authView = new AuthView();
  const userView = new UserView();
  const roomView = new RoomView();
  const barcodeView = new BarcodeView();

  // Controllers
  const authController = new AuthController(authService, authView);
  const userController = new UserController(userService, userView);
  const roomController = new RoomController(roomService, roomView);
  const barcodeController = new BarcodeController(
    barcodeService,
    roomService,
    barcodeView,
  );

  // Graceful shutdown for Prisma connections
  if (prisma) {
    process.on('SIGINT', async () => {
      await prisma!.$disconnect();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await prisma!.$disconnect();
      process.exit(0);
    });
  }

  // Start CLI
  const router = new Router()
    .register(authController)
    .register(userController)
    .register(roomController)
    .register(barcodeController);

  router.start();
})();
