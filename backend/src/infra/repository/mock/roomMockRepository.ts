import { randomUUID } from 'node:crypto';
import { Room } from '../../../model/room';
import { RoomRepository } from '../../../repository/roomRepository';

export class RoomMockRepository implements RoomRepository {
  private store = new Map<string, Room>();

  getRoomById(id: string): Promise<Room | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  createRoom(room: Room): Promise<Room> {
    const created = new Room(randomUUID(), room.name, room.userId);
    this.store.set(created.id!, created);
    return Promise.resolve(created);
  }

  updateRoom(room: Room): Promise<Room> {
    this.store.set(room.id!, room);
    return Promise.resolve(room);
  }

  deleteRoom(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }

  getUserRooms(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<Room[]> {
    const all = [...this.store.values()].filter((r) => r.userId === userId);
    return Promise.resolve(all.slice((page - 1) * pageSize, page * pageSize));
  }

  countUserRooms(userId: string): Promise<number> {
    return Promise.resolve(
      [...this.store.values()].filter((r) => r.userId === userId).length,
    );
  }
}
