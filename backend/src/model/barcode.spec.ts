import { Barcode } from './barcode';

describe('Barcode', () => {
  const make = () => new Barcode('id-1', 'ABC123', 'room-1', 2);

  describe('constructor', () => {
    it('sets all fields', () => {
      const b = new Barcode('id-1', 'ABC123', 'room-1', 3);
      expect(b.id).toBe('id-1');
      expect(b.value).toBe('ABC123');
      expect(b.roomId).toBe('room-1');
      expect(b.quantity).toBe(3);
    });

    it('defaults quantity to 1', () => {
      const b = new Barcode(undefined, 'ABC', 'room-1');
      expect(b.quantity).toBe(1);
    });

    it('accepts undefined id', () => {
      const b = new Barcode(undefined, 'ABC', 'room-1');
      expect(b.id).toBeUndefined();
    });
  });

  describe('copy()', () => {
    it('returns a new instance with the same values', () => {
      const b = make();
      const c = b.copy();
      expect(c).not.toBe(b);
      expect(c).toEqual(b);
    });
  });

  describe('update()', () => {
    it('returns a new instance', () => {
      const b = make();
      expect(b.update()).not.toBe(b);
    });

    it('updates value when provided', () => {
      const b = make();
      expect(b.update('NEW').value).toBe('NEW');
    });

    it('keeps original value when not provided', () => {
      const b = make();
      expect(b.update(undefined, 5).value).toBe(b.value);
    });

    it('updates quantity when provided', () => {
      const b = make();
      expect(b.update(undefined, 5).quantity).toBe(5);
    });

    it('keeps original quantity when not provided', () => {
      const b = make();
      expect(b.update('NEW').quantity).toBe(b.quantity);
    });

    it('does not mutate the original', () => {
      const b = make();
      const original = { value: b.value, quantity: b.quantity };
      b.update('CHANGED', 99);
      expect(b.value).toBe(original.value);
      expect(b.quantity).toBe(original.quantity);
    });
  });
});
