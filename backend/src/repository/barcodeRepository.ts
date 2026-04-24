import { Barcode } from '../model/barcode';

export interface BarcodeRepository {
  getBarcodeById(id: string): Promise<Barcode | null>;
  createBarcode(barcode: Barcode): Promise<Barcode>;
  updateBarcode(barcode: Barcode): Promise<Barcode>;
  deleteBarcode(id: string): Promise<void>;
  getRoomBarcodes(
    roomId: string,
    page: number,
    pageSize: number,
  ): Promise<Barcode[]>;
  exportAllBarcodes(roomId: string): Promise<Barcode[]>;
  countBarcodes(roomId: string): Promise<number>;
}
