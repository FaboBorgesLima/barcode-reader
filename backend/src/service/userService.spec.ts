import { UserService } from './userSerivice';
import { UserMockRepository } from '../infra/repository/mock/userMockRepository';
import { User } from '../model/user';

describe('UserService', () => {
  let repo: UserMockRepository;
  let service: UserService;
  let user: User;

  beforeEach(async () => {
    repo = new UserMockRepository();
    service = new UserService(repo);
    user = await repo.createUser(
      new User(undefined, 'Alice', 'alice@example.com'),
    );
  });

  describe('canUpdateUser()', () => {
    it('returns true when IDs match', async () => {
      expect(await service.canUpdateUser(user, user.id!)).toBe(true);
    });

    it('returns false when IDs differ', async () => {
      expect(await service.canUpdateUser(user, 'other-id')).toBe(false);
    });

    it('returns false for null user', async () => {
      expect(await service.canUpdateUser(null, user.id!)).toBe(false);
    });
  });

  describe('canDeleteUser()', () => {
    it('returns true for own id', async () => {
      expect(await service.canDeleteUser(user, user.id!)).toBe(true);
    });

    it('returns false for null user', async () => {
      expect(await service.canDeleteUser(null, 'any')).toBe(false);
    });
  });

  describe('getUserById()', () => {
    it('returns the user', async () => {
      const found = await service.getUserById(user.id!);
      expect(found).toEqual(user);
    });

    it('returns null for unknown id', async () => {
      expect(await service.getUserById('ghost')).toBeNull();
    });
  });

  describe('updateUser()', () => {
    it('updates and returns the user', async () => {
      const updated = await service.updateUser(user.id!, 'Bob');
      expect(updated.name).toBe('Bob');
    });

    it('throws 404 for unknown id', async () => {
      await expect(service.updateUser('ghost', 'Bob')).rejects.toMatchObject({
        code: 404,
      });
    });
  });

  describe('deleteUser()', () => {
    it('deletes the user', async () => {
      await service.deleteUser(user.id!);
      expect(await repo.getUserById(user.id!)).toBeNull();
    });

    it('throws 404 for unknown id', async () => {
      await expect(service.deleteUser('ghost')).rejects.toMatchObject({
        code: 404,
      });
    });
  });
});
