import 'reflect-metadata';
import { MockTokenService } from './infra/repository/mock/tokenServiceMock';
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
import {
  createRepositories,
  DB_BACKENDS,
  type DbBackend,
} from './factory/repositoryFactory';
import {
  createAuthStrategy,
  AUTH_STRATEGIES,
  type AuthStrategyType,
} from './factory/authStrategyFactory';

function parseFlag<T extends string>(
  flag: string,
  valid: readonly T[],
  defaultValue: T,
): T {
  const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
  if (!arg) return defaultValue;
  const value = arg.split('=')[1] as T;
  if (!valid.includes(value)) {
    console.error(
      `Invalid --${flag} value "${value}". Valid options: ${valid.join(', ')}`,
    );
    process.exit(1);
  }
  return value;
}

const db = parseFlag<DbBackend>('db', DB_BACKENDS, 'mock');
const auth = parseFlag<AuthStrategyType>('auth', AUTH_STRATEGIES, 'mock');

(async () => {
  const { userRepo, roomRepo, barcodeRepo, prisma } =
    await createRepositories(db);
  console.log(`[DB]   ${db}`);
  console.log(`[Auth] ${auth}`);

  const authStrategy = createAuthStrategy(auth);
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

  // Graceful shutdown
  if (prisma) {
    const shutdown = async () => {
      await prisma.$disconnect();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  new Router()
    .register(authController)
    .register(userController)
    .register(roomController)
    .register(barcodeController)
    .start();
})();
