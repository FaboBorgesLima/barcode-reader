import { BarcodeService } from './barcodeService';
import { RoomService } from './roomService';
import { BarcodeMockRepository } from '../infra/repository/mock/barcodeMockRepository';
import { RoomMockRepository } from '../infra/repository/mock/roomMockRepository';
import { Barcode } from '../model/barcode';
import { Room } from '../model/room';

describe('BarcodeService', () => {
  let barcodeRepo: BarcodeMockRepository;
  let roomRepo: RoomMockRepository;
  let roomService: RoomService;
  let service: BarcodeService;

  const userId = 'user-1';
  const otherId = 'user-2';
  let room: Room;

  beforeEach(async () => {
    barcodeRepo = new BarcodeMockRepository();
    roomRepo = new RoomMockRepository();
    roomService = new RoomService(roomRepo);
    service = new BarcodeService(barcodeRepo, roomService);

    room = await roomRepo.createRoom(new Room(undefined, 'Lab', userId));
  });

  // ── authorization helpers ──────────────────────────────────────────────────

  describe('canViewBarcode()', () => {
    it('returns true when room belongs to user and barcode is in room', async () => {
      const b = await barcodeRepo.createBarcode(
        new Barcode(undefined, 'ABC', room.id!),
      );
      expect(await service.canViewBarcode(b, room, userId)).toBe(true);
    });

    it('returns false when barcode is in a different room', async () => {
      const other = await roomRepo.createRoom(
        new Room(undefined, 'Other', userId),
      );
      const b = await barcodeRepo.createBarcode(
        new Barcode(undefined, 'ABC', other.id!),
      );
      expect(await service.canViewBarcode(b, room, userId)).toBe(false);
    });

    it('returns false when room belongs to another user', async () => {
      const b = await barcodeRepo.createBarcode(
        new Barcode(undefined, 'ABC', room.id!),
      );
      expect(await service.canViewBarcode(b, room, otherId)).toBe(false);
    });
  });

  describe('canUpdateBarcode()', () => {
    it('returns true for own room and matching barcode', async () => {
      const b = await barcodeRepo.createBarcode(
        new Barcode(undefined, 'ABC', room.id!),
      );
      expect(await service.canUpdateBarcode(b, room, userId)).toBe(true);
    });

    it('returns false for another user', async () => {
      const b = await barcodeRepo.createBarcode(
        new Barcode(undefined, 'ABC', room.id!),
      );
      expect(await service.canUpdateBarcode(b, room, otherId)).toBe(false);
    });
  });

  describe('canDeleteBarcode()', () => {
    it('returns true for own room and non-null barcode', async () => {
      const b = await barcodeRepo.createBarcode(
        new Barcode(undefined, 'ABC', room.id!),
      );
      expect(await service.canDeleteBarcode(b, room, userId)).toBe(true);
    });

    it('returns false for null barcode', async () => {
      expect(await service.canDeleteBarcode(null, room, userId)).toBe(false);
    });
  });

  // ── CRUD ───────────────────────────────────────────────────────────────────

  describe('createBarcode()', () => {
    it('creates and returns a barcode', async () => {
      const b = await service.createBarcode(room.id!, 'ABC123');
      expect(b.id).toBeDefined();
      expect(b.value).toBe('ABC123');
      expect(b.roomId).toBe(room.id!);
    });

    it('throws 429 when room already has 100 barcodes', async () => {
      await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          barcodeRepo.createBarcode(
            new Barcode(undefined, `VAL${i}`, room.id!),
          ),
        ),
      );
      await expect(
        service.createBarcode(room.id!, 'OVER'),
      ).rejects.toMatchObject({ code: 429 });
    });
  });

  describe('getBarcodeById()', () => {
    it('returns a barcode by id', async () => {
      const created = await barcodeRepo.createBarcode(
        new Barcode(undefined, 'ABC', room.id!),
      );
      expect(await service.getBarcodeById(created.id!)).toEqual(created);
    });

    it('returns null for unknown id', async () => {
      expect(await service.getBarcodeById('missing')).toBeNull();
    });
  });

  describe('updateBarcode()', () => {
    it('updates value and quantity', async () => {
      const created = await barcodeRepo.createBarcode(
        new Barcode(undefined, 'ABC', room.id!),
      );
      const updated = await service.updateBarcode(created.id!, 'NEW', 5);
      expect(updated.value).toBe('NEW');
      expect(updated.quantity).toBe(5);
    });

    it('throws 404 for unknown id', async () => {
      await expect(service.updateBarcode('missing')).rejects.toMatchObject({
        code: 404,
      });
    });
  });

  describe('deleteBarcode()', () => {
    it('deletes an existing barcode', async () => {
      const created = await barcodeRepo.createBarcode(
        new Barcode(undefined, 'ABC', room.id!),
      );
      await service.deleteBarcode(created.id!);
      expect(await barcodeRepo.getBarcodeById(created.id!)).toBeNull();
    });
  });

  describe('getRoomBarcodes()', () => {
    it('returns paginated barcodes for a room', async () => {
      await Promise.all(
        Array.from({ length: 3 }, (_, i) =>
          barcodeRepo.createBarcode(new Barcode(undefined, `V${i}`, room.id!)),
        ),
      );
      const page1 = await service.getRoomBarcodes(room.id!, 1, 2);
      expect(page1).toHaveLength(2);
      const page2 = await service.getRoomBarcodes(room.id!, 2, 2);
      expect(page2).toHaveLength(1);
    });
  });

  describe('exportAllBarcodes()', () => {
    it('returns all barcodes for a room', async () => {
      await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          barcodeRepo.createBarcode(new Barcode(undefined, `V${i}`, room.id!)),
        ),
      );
      const all = await service.exportAllBarcodes(room.id!);
      expect(all).toHaveLength(5);
    });
  });
});
