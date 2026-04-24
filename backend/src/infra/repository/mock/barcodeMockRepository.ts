import { randomUUID } from 'node:crypto';
import { Barcode } from '../../../model/barcode';
import { BarcodeRepository } from '../../../repository/barcodeRepository';

export class BarcodeMockRepository implements BarcodeRepository {
  private store = new Map<string, Barcode>();

  getBarcodeById(id: string): Promise<Barcode | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  createBarcode(barcode: Barcode): Promise<Barcode> {
    const created = new Barcode(
      randomUUID(),
      barcode.value,
      barcode.roomId,
      barcode.quantity,
    );
    this.store.set(created.id!, created);
    return Promise.resolve(created);
  }

  updateBarcode(barcode: Barcode): Promise<Barcode> {
    this.store.set(barcode.id!, barcode);
    return Promise.resolve(barcode);
  }

  deleteBarcode(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }

  getRoomBarcodes(
    roomId: string,
    page: number,
    pageSize: number,
  ): Promise<Barcode[]> {
    const all = [...this.store.values()].filter((b) => b.roomId === roomId);
    return Promise.resolve(all.slice((page - 1) * pageSize, page * pageSize));
  }

  exportAllBarcodes(roomId: string): Promise<Barcode[]> {
    return Promise.resolve(
      [...this.store.values()].filter((b) => b.roomId === roomId),
    );
  }

  countBarcodes(roomId: string): Promise<number> {
    return Promise.resolve(
      [...this.store.values()].filter((b) => b.roomId === roomId).length,
    );
  }
}
