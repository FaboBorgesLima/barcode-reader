import { Otp } from './otp';

const future = () => new Date(Date.now() + 60_000);
const past = () => new Date(Date.now() - 60_000);

describe('Otp', () => {
  describe('isExpired()', () => {
    it('returns false when expiresAt is in the future', () => {
      const otp = new Otp('id', 'a@b.com', 'hash', future(), false);
      expect(otp.isExpired()).toBe(false);
    });

    it('returns true when expiresAt is in the past', () => {
      const otp = new Otp('id', 'a@b.com', 'hash', past(), false);
      expect(otp.isExpired()).toBe(true);
    });
  });

  describe('isValid()', () => {
    it('returns true when not used and not expired', () => {
      const otp = new Otp('id', 'a@b.com', 'hash', future(), false);
      expect(otp.isValid()).toBe(true);
    });

    it('returns false when used', () => {
      const otp = new Otp('id', 'a@b.com', 'hash', future(), true);
      expect(otp.isValid()).toBe(false);
    });

    it('returns false when expired', () => {
      const otp = new Otp('id', 'a@b.com', 'hash', past(), false);
      expect(otp.isValid()).toBe(false);
    });

    it('returns false when used and expired', () => {
      const otp = new Otp('id', 'a@b.com', 'hash', past(), true);
      expect(otp.isValid()).toBe(false);
    });
  });
});
