import { Injectable } from '@nestjs/common';
import { Room } from '../../model/room';
import { RoomRepository } from '../../repository/roomRepository';
import { PrismaService } from '../prisma/prismaService';

@Injectable()
export class PrismaRoomRepository implements RoomRepository {
    constructor(private readonly prisma: PrismaService) {}

    private map(row: { id: string; name: string; userId: string }): Room {
        return new Room(row.id, row.name, row.userId);
    }

    async getRoomById(id: string): Promise<Room | null> {
        const row = await this.prisma.room.findUnique({ where: { id } });
        return row ? this.map(row) : null;
    }

    async createRoom(room: Room): Promise<Room> {
        const row = await this.prisma.room.create({
            data: { name: room.name, userId: room.userId },
        });
        return this.map(row);
    }

    async updateRoom(room: Room): Promise<Room> {
        const row = await this.prisma.room.update({
            where: { id: room.id },
            data: { name: room.name },
        });
        return this.map(row);
    }

    async deleteRoom(id: string): Promise<void> {
        await this.prisma.room.delete({ where: { id } });
    }

    async getUserRooms(userId: string, page: number, pageSize: number): Promise<Room[]> {
        const rows = await this.prisma.room.findMany({
            where: { userId },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return rows.map((r) => this.map(r));
    }

    async countUserRooms(userId: string): Promise<number> {
        return this.prisma.room.count({ where: { userId } });
    }
}
