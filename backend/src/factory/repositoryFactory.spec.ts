import { createRepositories, DB_BACKENDS } from './repositoryFactory';
import { UserMockRepository } from '../infra/repository/mock/userMockRepository';
import { RoomMockRepository } from '../infra/repository/mock/roomMockRepository';
import { BarcodeMockRepository } from '../infra/repository/mock/barcodeMockRepository';

// Prevent real DB connections in tests
jest.mock('../infra/prisma/prismaService', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../infra/repository/prismaUserRepository', () => ({
  PrismaUserRepository: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../infra/repository/prismaRoomRepository', () => ({
  PrismaRoomRepository: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../infra/repository/prismaBarcodeRepository', () => ({
  PrismaBarcodeRepository: jest.fn().mockImplementation(() => ({})),
}));

describe('createRepositories()', () => {
  describe('mock backend', () => {
    it('returns in-memory repositories without a prisma instance', async () => {
      const result = await createRepositories('mock');
      expect(result.userRepo).toBeInstanceOf(UserMockRepository);
      expect(result.roomRepo).toBeInstanceOf(RoomMockRepository);
      expect(result.barcodeRepo).toBeInstanceOf(BarcodeMockRepository);
      expect(result.prisma).toBeUndefined();
    });
  });

  describe('postgres backend', () => {
    it('calls $connect and returns a prisma instance', async () => {
      const result = await createRepositories('postgres');
      expect(result.prisma).toBeDefined();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { $connect } = jest.mocked(result.prisma!);
      expect($connect).toHaveBeenCalled();
    });

    it('returns all three repositories', async () => {
      const { userRepo, roomRepo, barcodeRepo } =
        await createRepositories('postgres');
      expect(userRepo).toBeDefined();
      expect(roomRepo).toBeDefined();
      expect(barcodeRepo).toBeDefined();
    });
  });

  it('covers all registered DB backends', async () => {
    for (const db of DB_BACKENDS) {
      await expect(createRepositories(db)).resolves.toBeDefined();
    }
  });
});
