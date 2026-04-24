import { DomainError } from '../error/domainError';
import { User } from '../model/user';
import { UserRepository } from '../repository/userRepository';

export class UserService {
  public constructor(protected userRepository: UserRepository) {}

  public async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.getUserById(id);
  }

  public canUpdateUser(user: User | null, userId: string): Promise<boolean> {
    return Promise.resolve(user !== null && user.id === userId);
  }

  public canDeleteUser(user: User | null, userId: string): Promise<boolean> {
    return Promise.resolve(user !== null && user.id === userId);
  }

  public async updateUser(id: string, name: string): Promise<User> {
    let user = await this.userRepository.getUserById(id);

    if (user === null) throw new DomainError('User not found', 404);

    user = user.update(name);

    return await this.userRepository.updateUser(user);
  }

  public async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.getUserById(id);

    if (user === null) throw new DomainError('User not found', 404);

    await this.userRepository.deleteUser(id);
  }
}
