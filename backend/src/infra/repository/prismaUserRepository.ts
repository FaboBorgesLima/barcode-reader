import { Injectable } from '@nestjs/common';
import { User } from '../../model/user';
import { UserRepository } from '../../repository/userRepository';
import { PrismaService } from '../prisma/prismaService';

@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getUserByEmail(email: string): Promise<User | null> {
        const row = await this.prisma.user.findUnique({ where: { email } });
        return row ? new User(row.id, row.name, row.email) : null;
    }

    async getUserById(id: string): Promise<User | null> {
        const row = await this.prisma.user.findUnique({ where: { id } });
        return row ? new User(row.id, row.name, row.email) : null;
    }

    async createUser(user: User): Promise<User> {
        const row = await this.prisma.user.create({
            data: { name: user.name, email: user.email },
        });
        return new User(row.id, row.name, row.email);
    }

    async updateUser(user: User): Promise<User> {
        const row = await this.prisma.user.update({
            where: { id: user.id },
            data: { name: user.name, email: user.email },
        });
        return new User(row.id, row.name, row.email);
    }

    async deleteUser(id: string): Promise<void> {
        await this.prisma.user.delete({ where: { id } });
    }
}
