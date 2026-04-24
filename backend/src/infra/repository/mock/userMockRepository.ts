import { randomUUID } from 'node:crypto';
import { User } from '../../../model/user';
import { UserRepository } from '../../../repository/userRepository';

export class UserMockRepository implements UserRepository {
  private store = new Map<string, User>();

  getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.store.values())
      if (user.email === email) return Promise.resolve(user);
    return Promise.resolve(null);
  }

  getUserById(id: string): Promise<User | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  createUser(user: User): Promise<User> {
    const created = new User(randomUUID(), user.name, user.email);
    this.store.set(created.id!, created);
    return Promise.resolve(created);
  }

  updateUser(user: User): Promise<User> {
    this.store.set(user.id!, user);
    return Promise.resolve(user);
  }

  deleteUser(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }
}
