import { DomainError } from "../../../error/domainError";
import { RoomService } from "../../../service/roomService";
import { CliCommand, CliController } from "../../../lib/cliDecorators";
import { RoomView } from "../view/roomView";

@CliController("room")
export class RoomController {
    public constructor(
        private roomService: RoomService,
        private view: RoomView,
    ) {}

    @CliCommand("create", "room create <userId> <name>")
    async create(args: string[]): Promise<void> {
        try {
            const [userId, name] = args;
            if (!userId || !name)
                return this.usage("room create <userId> <name>");
            const room = await this.roomService.createRoom(name, userId);
            this.view.displayRoom(room);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("get", "room get <id>")
    async get(args: string[]): Promise<void> {
        try {
            const [id] = args;
            if (!id) return this.usage("room get <id>");
            const room = await this.roomService.getRoomById(id);
            if (!room) return this.view.displayError("Room not found");
            this.view.displayRoom(room);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("list", "room list <userId> [page] [pageSize]")
    async list(args: string[]): Promise<void> {
        try {
            const [userId, page, size] = args;
            if (!userId) return this.usage("room list <userId> [page] [size]");
            const rooms = await this.roomService.getUserRooms(
                userId,
                Number(page ?? 1),
                Number(size ?? 10),
            );
            this.view.displayList(rooms);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("update", "room update <id> <name>")
    async update(args: string[]): Promise<void> {
        try {
            const [id, name] = args;
            if (!id || !name) return this.usage("room update <id> <name>");
            const room = await this.roomService.updateRoom(id, name);
            this.view.displayRoom(room);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("delete", "room delete <id>")
    async delete(args: string[]): Promise<void> {
        try {
            const [id] = args;
            if (!id) return this.usage("room delete <id>");
            await this.roomService.deleteRoom(id);
            this.view.displayDeleted(id);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    private usage(syntax: string): void {
        this.view.displayError(`Usage: ${syntax}`);
    }
}
