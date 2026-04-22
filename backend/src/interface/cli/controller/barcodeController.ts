import { DomainError } from "../../../error/domainError";
import { BarcodeService } from "../../../service/barcodeService";
import { RoomService } from "../../../service/roomService";
import { CliCommand, CliController } from "../../../lib/cliDecorators";
import { BarcodeView } from "../view/barcodeView";

@CliController("barcode")
export class BarcodeController {
    public constructor(
        private barcodeService: BarcodeService,
        private roomService: RoomService,
        private view: BarcodeView,
    ) {}

    @CliCommand("create", "barcode create <roomId> <value> <userId>")
    async create(args: string[]): Promise<void> {
        try {
            const [roomId, value, userId] = args;
            if (!roomId || !value || !userId)
                return this.usage("barcode create <roomId> <value> <userId>");
            const room = await this.roomService.getRoomById(roomId);
            if (!room || !(await this.roomService.canViewRoom(room, userId)))
                return this.view.displayError(
                    "Room not found or access denied",
                );
            const barcode = await this.barcodeService.createBarcode(
                roomId,
                value,
            );
            this.view.displayBarcode(barcode);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("get", "barcode get <id>")
    async get(args: string[]): Promise<void> {
        try {
            const [id] = args;
            if (!id) return this.usage("barcode get <id>");
            const barcode = await this.barcodeService.getBarcodeById(id);
            if (!barcode) return this.view.displayError("Barcode not found");
            this.view.displayBarcode(barcode);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("list", "barcode list <roomId> [page] [pageSize]")
    async list(args: string[]): Promise<void> {
        try {
            const [roomId, page, size] = args;
            if (!roomId)
                return this.usage("barcode list <roomId> [page] [size]");
            const barcodes = await this.barcodeService.getRoomBarcodes(
                roomId,
                Number(page ?? 1),
                Number(size ?? 10),
            );
            this.view.displayList(barcodes);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("update", "barcode update <id> <value> <userId>")
    async update(args: string[]): Promise<void> {
        try {
            const [id, value, userId] = args;
            if (!id || !value || !userId)
                return this.usage("barcode update <id> <value> <userId>");
            const barcode = await this.barcodeService.getBarcodeById(id);
            if (!barcode) return this.view.displayError("Barcode not found");
            const room = await this.roomService.getRoomById(barcode.roomId);
            if (
                !room ||
                !(await this.barcodeService.canUpdateBarcode(
                    barcode,
                    room,
                    userId,
                ))
            )
                return this.view.displayError(
                    "Room not found or access denied",
                );
            const updated = await this.barcodeService.updateBarcode(id, value);
            this.view.displayBarcode(updated);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("delete", "barcode delete <id> <userId>")
    async delete(args: string[]): Promise<void> {
        try {
            const [id, userId] = args;
            if (!id || !userId)
                return this.usage("barcode delete <id> <userId>");
            const barcode = await this.barcodeService.getBarcodeById(id);
            if (!barcode) return this.view.displayError("Barcode not found");
            const room = await this.roomService.getRoomById(barcode.roomId);
            if (
                !room ||
                !(await this.barcodeService.canDeleteBarcode(
                    barcode,
                    room,
                    userId,
                ))
            )
                return this.view.displayError(
                    "Room not found or access denied",
                );
            await this.barcodeService.deleteBarcode(id);
            this.view.displayDeleted(id);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("export", "barcode export <roomId>")
    async export(args: string[]): Promise<void> {
        try {
            const [roomId] = args;
            if (!roomId) return this.usage("barcode export <roomId>");
            const barcodes =
                await this.barcodeService.exportAllBarcodes(roomId);
            this.view.displayList(barcodes);
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
