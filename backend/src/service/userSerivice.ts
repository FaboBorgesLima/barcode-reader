import { DomainError } from "../error/domainError";
import { User } from "../model/user";
import { UserRepository } from "../repository/userRepository";

export class UserService {
    public constructor(protected userRepository: UserRepository) {}

    public async getUserById(id: string): Promise<User | null> {
        return await this.userRepository.getUserById(id);
    }

    public async updateUser(id: string, name: string): Promise<User> {
        let user = await this.userRepository.getUserById(id);

        if (user === null) throw new DomainError("User not found", 404);

        user = user.update(name);

        return await this.userRepository.updateUser(user);
    }
}
