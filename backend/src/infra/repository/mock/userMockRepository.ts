import { randomUUID } from 'node:crypto';
import { User } from '../../../model/user';
import { UserRepository } from '../../../repository/userRepository';

export class UserMockRepository implements UserRepository {
  private store = new Map<string, User>();

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.store.values())
      if (user.email === email) return user;
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async createUser(user: User): Promise<User> {
    const created = new User(randomUUID(), user.name, user.email);
    this.store.set(created.id!, created);
    return created;
  }

  async updateUser(user: User): Promise<User> {
    this.store.set(user.id!, user);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    this.store.delete(id);
  }
}
