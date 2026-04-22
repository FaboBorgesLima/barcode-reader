import { randomUUID } from "node:crypto";
import { Barcode } from "../../model/barcode";
import { BarcodeRepository } from "../../repository/barcodeRepository";

export class BarcodeMockRepository implements BarcodeRepository {
    private store = new Map<string, Barcode>();

    async getBarcodeById(id: string): Promise<Barcode | null> {
        return this.store.get(id) ?? null;
    }

    async createBarcode(barcode: Barcode): Promise<Barcode> {
        const created = new Barcode(
            randomUUID(),
            barcode.value,
            barcode.roomId,
            barcode.quantity,
        );
        this.store.set(created.id!, created);
        return created;
    }

    async updateBarcode(barcode: Barcode): Promise<Barcode> {
        this.store.set(barcode.id!, barcode);
        return barcode;
    }

    async deleteBarcode(id: string): Promise<void> {
        this.store.delete(id);
    }

    async getRoomBarcodes(
        roomId: string,
        page: number,
        pageSize: number,
    ): Promise<Barcode[]> {
        const all = [...this.store.values()].filter((b) => b.roomId === roomId);
        return all.slice((page - 1) * pageSize, page * pageSize);
    }

    async exportAllBarcodes(roomId: string): Promise<Barcode[]> {
        return [...this.store.values()].filter((b) => b.roomId === roomId);
    }

    async countBarcodes(roomId: string): Promise<number> {
        return [...this.store.values()].filter((b) => b.roomId === roomId)
            .length;
    }
}
