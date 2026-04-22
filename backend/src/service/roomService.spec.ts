import { RoomService } from './roomService';
import { RoomMockRepository } from '../infra/repository/mock/roomMockRepository';
import { Room } from '../model/room';
import { DomainError } from '../error/domainError';

describe('RoomService', () => {
  let repo: RoomMockRepository;
  let service: RoomService;
  const userId = 'user-1';
  const otherId = 'user-2';

  beforeEach(() => {
    repo = new RoomMockRepository();
    service = new RoomService(repo);
  });

  // ── authorization helpers ──────────────────────────────────────────────────

  describe('canUpdateRoom()', () => {
    it('returns true when room belongs to user', async () => {
      const room = new Room('r1', 'Lab', userId);
      expect(await service.canUpdateRoom(room, userId)).toBe(true);
    });

    it('returns false when room belongs to another user', async () => {
      const room = new Room('r1', 'Lab', otherId);
      expect(await service.canUpdateRoom(room, userId)).toBe(false);
    });

    it('returns false for null room', async () => {
      expect(await service.canUpdateRoom(null, userId)).toBe(false);
    });
  });

  describe('canDeleteRoom()', () => {
    it('returns true for own room', async () => {
      const room = new Room('r1', 'Lab', userId);
      expect(await service.canDeleteRoom(room, userId)).toBe(true);
    });

    it('returns false for null room', async () => {
      expect(await service.canDeleteRoom(null, userId)).toBe(false);
    });
  });

  describe('canViewRoom()', () => {
    it('returns true for own room', async () => {
      const room = new Room('r1', 'Lab', userId);
      expect(await service.canViewRoom(room, userId)).toBe(true);
    });

    it("returns false for another user's room", async () => {
      const room = new Room('r1', 'Lab', otherId);
      expect(await service.canViewRoom(room, userId)).toBe(false);
    });
  });

  // ── CRUD ───────────────────────────────────────────────────────────────────

  describe('createRoom()', () => {
    it('creates and returns a room', async () => {
      const room = await service.createRoom('Lab', userId);
      expect(room.id).toBeDefined();
      expect(room.name).toBe('Lab');
      expect(room.userId).toBe(userId);
    });

    it('throws 429 when user already has 100 rooms', async () => {
      const creates = Array.from({ length: 100 }, (_, i) =>
        repo.createRoom(new Room(undefined, `Room ${i}`, userId)),
      );
      await Promise.all(creates);
      await expect(
        service.createRoom('One More', userId),
      ).rejects.toMatchObject({ code: 429 });
    });
  });

  describe('getRoomById()', () => {
    it('returns a room by id', async () => {
      const created = await repo.createRoom(new Room(undefined, 'Lab', userId));
      const found = await service.getRoomById(created.id!);
      expect(found).toEqual(created);
    });

    it('returns null for unknown id', async () => {
      expect(await service.getRoomById('non-existent')).toBeNull();
    });
  });

  describe('updateRoom()', () => {
    it('updates and returns the room', async () => {
      const created = await repo.createRoom(new Room(undefined, 'Lab', userId));
      const updated = await service.updateRoom(created.id!, 'New Name');
      expect(updated.name).toBe('New Name');
    });

    it('throws 404 for unknown id', async () => {
      await expect(service.updateRoom('missing', 'Name')).rejects.toMatchObject(
        { code: 404 },
      );
    });
  });

  describe('deleteRoom()', () => {
    it('deletes an existing room', async () => {
      const created = await repo.createRoom(new Room(undefined, 'Lab', userId));
      await service.deleteRoom(created.id!);
      expect(await repo.getRoomById(created.id!)).toBeNull();
    });

    it('throws 404 for unknown id', async () => {
      await expect(service.deleteRoom('missing')).rejects.toMatchObject({
        code: 404,
      });
    });
  });

  describe('getUserRooms()', () => {
    it('returns rooms for the user with pagination', async () => {
      await Promise.all(
        Array.from({ length: 3 }, (_, i) =>
          repo.createRoom(new Room(undefined, `Room ${i}`, userId)),
        ),
      );
      const page1 = await service.getUserRooms(userId, 1, 2);
      expect(page1).toHaveLength(2);
      const page2 = await service.getUserRooms(userId, 2, 2);
      expect(page2).toHaveLength(1);
    });

    it('does not return rooms belonging to other users', async () => {
      await repo.createRoom(new Room(undefined, 'Other', otherId));
      const rooms = await service.getUserRooms(userId, 1, 10);
      expect(rooms).toHaveLength(0);
    });
  });
});
