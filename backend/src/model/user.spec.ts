import { User } from './user';

describe('User', () => {
  const make = () => new User('id-1', 'John Doe', 'john@example.com');

  describe('constructor', () => {
    it('sets all fields', () => {
      const u = make();
      expect(u.id).toBe('id-1');
      expect(u.name).toBe('John Doe');
      expect(u.email).toBe('john@example.com');
    });

    it('accepts undefined id', () => {
      const u = new User(undefined, 'Jane', 'jane@example.com');
      expect(u.id).toBeUndefined();
    });
  });

  describe('copy()', () => {
    it('returns a new instance with the same values', () => {
      const u = make();
      const c = u.copy();
      expect(c).not.toBe(u);
      expect(c).toEqual(u);
    });
  });

  describe('update()', () => {
    it('returns a new instance', () => {
      const u = make();
      expect(u.update()).not.toBe(u);
    });

    it('updates name when provided', () => {
      const u = make();
      expect(u.update('Jane Doe').name).toBe('Jane Doe');
    });

    it('keeps original name when not provided', () => {
      const u = make();
      expect(u.update(undefined, 'new@example.com').name).toBe('John Doe');
    });

    it('updates email when provided', () => {
      const u = make();
      expect(u.update(undefined, 'new@example.com').email).toBe(
        'new@example.com',
      );
    });

    it('keeps original email when not provided', () => {
      const u = make();
      expect(u.update('Jane').email).toBe('john@example.com');
    });

    it('does not mutate the original', () => {
      const u = make();
      u.update('Changed', 'changed@example.com');
      expect(u.name).toBe('John Doe');
      expect(u.email).toBe('john@example.com');
    });
  });
});
