import { MockAuthStrategy } from "./db/mock/mockAuthStrategy";
import { BarcodeMockRepository } from "./db/mock/barcodeMockRepository";
import { RoomMockRepository } from "./db/mock/roomMockRepository";
import { MockTokenService } from "./db/mock/tokenServiceMock";
import { UserMockRepository } from "./db/mock/userMockRepository";
import { AuthController } from "./interface/cli/controller/authController";
import { BarcodeController } from "./interface/cli/controller/barcodeController";
import { RoomController } from "./interface/cli/controller/roomController";
import { UserController } from "./interface/cli/controller/userController";
import { Router } from "./interface/cli/router";
import { AuthView } from "./interface/cli/view/authView";
import { BarcodeView } from "./interface/cli/view/barcodeView";
import { RoomView } from "./interface/cli/view/roomView";
import { UserView } from "./interface/cli/view/userView";
import { AuthService } from "./service/authService";
import { BarcodeService } from "./service/barcodeService";
import { RoomService } from "./service/roomService";
import { UserService } from "./service/userSerivice";

// Repositories
const userRepo = new UserMockRepository();
const roomRepo = new RoomMockRepository();
const barcodeRepo = new BarcodeMockRepository();

// Infrastructure services
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

// Start CLI
const router = new Router()
    .register(authController)
    .register(userController)
    .register(roomController)
    .register(barcodeController);

router.start();
