import { Room } from './room';

describe('Room', () => {
  const make = () => new Room('id-1', 'Warehouse A', 'user-1');

  describe('constructor', () => {
    it('sets all fields', () => {
      const r = make();
      expect(r.id).toBe('id-1');
      expect(r.name).toBe('Warehouse A');
      expect(r.userId).toBe('user-1');
    });

    it('accepts undefined id', () => {
      const r = new Room(undefined, 'Lab', 'user-1');
      expect(r.id).toBeUndefined();
    });
  });

  describe('copy()', () => {
    it('returns a new instance with the same values', () => {
      const r = make();
      const c = r.copy();
      expect(c).not.toBe(r);
      expect(c).toEqual(r);
    });
  });

  describe('update()', () => {
    it('returns a new instance', () => {
      const r = make();
      expect(r.update()).not.toBe(r);
    });

    it('updates name when provided', () => {
      const r = make();
      expect(r.update('New Name').name).toBe('New Name');
    });

    it('keeps original name when not provided', () => {
      const r = make();
      expect(r.update().name).toBe('Warehouse A');
    });

    it('does not mutate the original', () => {
      const r = make();
      r.update('Changed');
      expect(r.name).toBe('Warehouse A');
    });
  });
});
