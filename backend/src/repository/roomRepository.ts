import { Room } from "../model/room";

export interface RoomRepository {
    getRoomById(id: string): Promise<Room | null>;
    createRoom(room: Room): Promise<Room>;
    updateRoom(room: Room): Promise<Room>;
    deleteRoom(id: string): Promise<void>;
    getUserRooms(
        userId: string,
        page: number,
        pageSize: number,
    ): Promise<Room[]>;
    countUserRooms(userId: string): Promise<number>;
}
