import { createAuthStrategy, AUTH_STRATEGIES } from './authStrategyFactory';
import { MockAuthStrategy } from '../infra/repository/mock/mockAuthStrategy';
import { NodemailerOtpAuthStrategy } from '../infra/auth/nodemailerOtpAuthStrategy';

describe('createAuthStrategy()', () => {
  it('returns a MockAuthStrategy for "mock"', () => {
    expect(createAuthStrategy('mock')).toBeInstanceOf(MockAuthStrategy);
  });

  it('returns a NodemailerOtpAuthStrategy for "nodemailer" when env vars are set', () => {
    process.env['SMTP_HOST'] = 'smtp.example.com';
    process.env['SMTP_USER'] = 'no-reply@example.com';
    process.env['SMTP_PASS'] = 'secret';

    const strategy = createAuthStrategy('nodemailer');
    expect(strategy).toBeInstanceOf(NodemailerOtpAuthStrategy);

    delete process.env['SMTP_HOST'];
    delete process.env['SMTP_USER'];
    delete process.env['SMTP_PASS'];
  });

  it('throws when "nodemailer" is used without required env vars', () => {
    delete process.env['SMTP_HOST'];
    delete process.env['SMTP_USER'];
    delete process.env['SMTP_PASS'];
    expect(() => createAuthStrategy('nodemailer')).toThrow(/SMTP_HOST/);
  });

  it('covers all registered strategy types', () => {
    // Ensure the factory handles every entry in AUTH_STRATEGIES
    // (so adding a new type without updating the factory is caught)
    process.env['SMTP_HOST'] = 'smtp.example.com';
    process.env['SMTP_USER'] = 'no-reply@example.com';
    process.env['SMTP_PASS'] = 'secret';

    for (const type of AUTH_STRATEGIES) {
      expect(() => createAuthStrategy(type)).not.toThrow();
    }

    delete process.env['SMTP_HOST'];
    delete process.env['SMTP_USER'];
    delete process.env['SMTP_PASS'];
  });
});
