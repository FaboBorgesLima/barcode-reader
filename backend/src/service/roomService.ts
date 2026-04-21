import { DomainError } from "../error/domainError";
import { Room } from "../model/room";
import { RoomRepository } from "../repository/roomRepository";

export class RoomService {
    public constructor(protected roomRepository: RoomRepository) {}

    public async canUpdateRoom(
        room: Room | null,
        userId: string,
    ): Promise<boolean> {
        return room !== null && room.userId === userId;
    }

    public async canDeleteRoom(
        room: Room | null,
        userId: string,
    ): Promise<boolean> {
        return room !== null && room.userId === userId;
    }

    public async canViewRoom(
        room: Room | null,
        userId: string,
    ): Promise<boolean> {
        return room !== null && room.userId === userId;
    }

    public async createRoom(name: string, userId: string): Promise<Room> {
        let room = new Room(undefined, name, userId);

        if ((await this.roomRepository.countUserRooms(userId)) >= 100)
            throw new DomainError(
                "User has reached the maximum number of rooms",
                429,
            );

        return await this.roomRepository.createRoom(room);
    }

    public async getRoomById(id: string): Promise<Room | null> {
        return await this.roomRepository.getRoomById(id);
    }

    public async updateRoom(id: string, name: string): Promise<Room> {
        let room = await this.roomRepository.getRoomById(id);

        if (room === null) throw new DomainError("Room not found", 404);

        room = room.update(name);

        return await this.roomRepository.updateRoom(room);
    }

    public async deleteRoom(id: string): Promise<void> {
        const room = await this.roomRepository.getRoomById(id);

        if (room === null) throw new DomainError("Room not found", 404);

        await this.roomRepository.deleteRoom(id);
    }

    public async getUserRooms(
        userId: string,
        page: number,
        pageSize: number,
    ): Promise<Room[]> {
        const rooms = await this.roomRepository.getUserRooms(
            userId,
            page,
            pageSize,
        );

        for (const room of rooms)
            if (!(await this.canViewRoom(room, userId)))
                throw new DomainError("Unauthorized access to room", 403);

        return rooms;
    }
}
