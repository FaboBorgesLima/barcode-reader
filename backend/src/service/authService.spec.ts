import { AuthService } from './authService';
import { UserMockRepository } from '../infra/repository/mock/userMockRepository';
import { MockAuthStrategy } from '../infra/repository/mock/mockAuthStrategy';
import { MockTokenService } from '../infra/repository/mock/tokenServiceMock';
import { User } from '../model/user';
import { DomainError } from '../error/domainError';

describe('AuthService', () => {
  let userRepo: UserMockRepository;
  let authStrategy: MockAuthStrategy;
  let tokenService: MockTokenService;
  let service: AuthService;

  beforeEach(() => {
    userRepo = new UserMockRepository();
    authStrategy = new MockAuthStrategy();
    tokenService = new MockTokenService();
    service = new AuthService(userRepo, authStrategy, tokenService);
  });

  describe('getGenericError()', () => {
    it('returns a DomainError with code 401', () => {
      const err = service.getGenericError();
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe(401);
      expect(err.message).toBe('Credential Expired or Invalid');
    });
  });

  describe('initiateAuth()', () => {
    it('delegates to the auth strategy', async () => {
      const spy = jest.spyOn(authStrategy, 'initiate');
      await service.initiateAuth('user@example.com');
      expect(spy).toHaveBeenCalledWith('user@example.com');
    });
  });

  describe('login()', () => {
    const email = 'user@example.com';

    beforeEach(async () => {
      await userRepo.createUser(new User(undefined, 'Alice', email));
      await authStrategy.initiate(email);
    });

    it('returns a token on valid credentials', async () => {
      const token = await service.login(email, '000000');
      expect(typeof token).toBe('string');
      expect(token).toMatch(/^mock::/);
    });

    it('throws 401 when credential is wrong', async () => {
      await expect(service.login(email, 'wrong')).rejects.toMatchObject({
        code: 401,
      });
    });

    it('throws 401 when user does not exist', async () => {
      const other = 'ghost@example.com';
      await authStrategy.initiate(other);
      await expect(service.login(other, '000000')).rejects.toMatchObject({
        code: 401,
      });
    });

    it('consumes the credential after successful login', async () => {
      await service.login(email, '000000');
      // Second login attempt with same OTP must fail (consumed)
      await authStrategy.initiate(email);
      // strategy is fresh now, but token was consumed in prior call — just verify verify returns false
      const consumeSpy = jest.spyOn(authStrategy, 'consume');
      await authStrategy.initiate(email);
      await service.login(email, '000000');
      expect(consumeSpy).toHaveBeenCalledWith(email);
    });
  });

  describe('register()', () => {
    const email = 'new@example.com';

    beforeEach(async () => {
      await authStrategy.initiate(email);
    });

    it('creates a user and returns a token', async () => {
      const token = await service.register('Bob', email, '000000');
      expect(token).toMatch(/^mock::/);
      const user = await userRepo.getUserByEmail(email);
      expect(user).not.toBeNull();
      expect(user!.name).toBe('Bob');
    });

    it('throws 401 when credential is wrong', async () => {
      await expect(service.register('Bob', email, 'bad')).rejects.toMatchObject(
        {
          code: 401,
        },
      );
    });

    it('throws 401 when user already exists', async () => {
      await service.register('Bob', email, '000000');
      await authStrategy.initiate(email);
      await expect(
        service.register('Bob2', email, '000000'),
      ).rejects.toMatchObject({ code: 401 });
    });
  });

  describe('logout()', () => {
    it('revokes the token', async () => {
      const payload = { userId: 'u1', email: 'a@b.com' };
      const token = tokenService.generateToken(payload);
      await service.logout(token);
      expect(() => tokenService.verifyToken(token)).toThrow();
    });
  });
});
