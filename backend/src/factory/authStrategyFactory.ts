import { MockAuthStrategy } from '../infra/repository/mock/mockAuthStrategy';
import { NodemailerOtpAuthStrategy } from '../infra/auth/nodemailerOtpAuthStrategy';
import type { AuthStrategy } from '../service/authStrategy';

export const AUTH_STRATEGIES = ['mock', 'nodemailer'] as const;
export type AuthStrategyType = (typeof AUTH_STRATEGIES)[number];

export function createAuthStrategy(type: AuthStrategyType): AuthStrategy {
  switch (type) {
    case 'nodemailer':
      return NodemailerOtpAuthStrategy.fromEnv();
    case 'mock':
      return new MockAuthStrategy();
  }
}
