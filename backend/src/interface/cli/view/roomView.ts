import { Room } from "../../../model/room";

export class RoomView {
    displayRoom(room: Room): void {
        console.log(`\n  ID:      ${room.id}`);
        console.log(`  Name:    ${room.name}`);
        console.log(`  User ID: ${room.userId}`);
    }

    displayList(rooms: Room[]): void {
        if (rooms.length === 0) {
            console.log("\n  No rooms found");
            return;
        }
        console.log(`\n  ${rooms.length} room(s):`);
        for (const room of rooms) {
            console.log(`    [${room.id}] ${room.name}`);
        }
    }

    displayDeleted(id: string): void {
        console.log(`\n  Room "${id}" deleted`);
    }

    displayError(message: string): void {
        console.error(`\n  Error: ${message}`);
    }
}
