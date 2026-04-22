import { randomUUID } from "node:crypto";
import { Room } from "../../model/room";
import { RoomRepository } from "../../repository/roomRepository";

export class RoomMockRepository implements RoomRepository {
    private store = new Map<string, Room>();

    async getRoomById(id: string): Promise<Room | null> {
        return this.store.get(id) ?? null;
    }

    async createRoom(room: Room): Promise<Room> {
        const created = new Room(randomUUID(), room.name, room.userId);
        this.store.set(created.id!, created);
        return created;
    }

    async updateRoom(room: Room): Promise<Room> {
        this.store.set(room.id!, room);
        return room;
    }

    async deleteRoom(id: string): Promise<void> {
        this.store.delete(id);
    }

    async getUserRooms(
        userId: string,
        page: number,
        pageSize: number,
    ): Promise<Room[]> {
        const all = [...this.store.values()].filter((r) => r.userId === userId);
        return all.slice((page - 1) * pageSize, page * pageSize);
    }

    async countUserRooms(userId: string): Promise<number> {
        return [...this.store.values()].filter((r) => r.userId === userId)
            .length;
    }
}
