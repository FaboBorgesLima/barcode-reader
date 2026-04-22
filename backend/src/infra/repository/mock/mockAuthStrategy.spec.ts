import { MockAuthStrategy } from './mockAuthStrategy';

describe('MockAuthStrategy', () => {
  let strategy: MockAuthStrategy;
  const identity = 'user@example.com';

  beforeEach(() => {
    strategy = new MockAuthStrategy();
  });

  describe('initiate()', () => {
    it('prints the fixed OTP to stdout', async () => {
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      await strategy.initiate(identity);
      expect(log).toHaveBeenCalledWith(expect.stringContaining('000000'));
      log.mockRestore();
    });
  });

  describe('verify()', () => {
    beforeEach(async () => {
      await strategy.initiate(identity);
    });

    it('returns true for the fixed OTP', async () => {
      expect(await strategy.verify(identity, '000000')).toBe(true);
    });

    it('returns false for wrong OTP', async () => {
      expect(await strategy.verify(identity, '111111')).toBe(false);
    });

    it('returns false for unknown identity', async () => {
      expect(await strategy.verify('unknown@example.com', '000000')).toBe(
        false,
      );
    });
  });

  describe('consume()', () => {
    it('removes the pending OTP so subsequent verify returns false', async () => {
      await strategy.initiate(identity);
      await strategy.consume(identity);
      expect(await strategy.verify(identity, '000000')).toBe(false);
    });
  });
});
