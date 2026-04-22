import { DomainError } from '../error/domainError';
import { Barcode } from '../model/barcode';
import { Room } from '../model/room';
import { BarcodeRepository } from '../repository/barcodeRepository';
import { RoomService } from './roomService';

export class BarcodeService {
  public constructor(
    protected barcodeRepository: BarcodeRepository,
    protected roomService: RoomService,
  ) {}

  public async canUpdateBarcode(
    barcode: Barcode,
    room: Room,
    userId: string,
  ): Promise<boolean> {
    return (
      (await this.roomService.canUpdateRoom(room, userId)) &&
      room.id === barcode.roomId
    );
  }

  public async canDeleteBarcode(
    barcode: Barcode | null,
    room: Room,
    userId: string,
  ): Promise<boolean> {
    return (
      barcode !== null &&
      (await this.roomService.canUpdateRoom(room, userId)) &&
      room.id === barcode.roomId
    );
  }

  public async canViewBarcode(
    barcode: Barcode,
    room: Room,
    userId: string,
  ): Promise<boolean> {
    return (
      (await this.roomService.canViewRoom(room, userId)) &&
      room.id === barcode.roomId
    );
  }

  public async createBarcode(roomId: string, data: string): Promise<Barcode> {
    let barcode = new Barcode(undefined, data, roomId);

    if ((await this.barcodeRepository.countBarcodes(roomId)) >= 100)
      throw new DomainError(
        'Room has reached the maximum number of barcodes',
        429,
      );

    return await this.barcodeRepository.createBarcode(barcode);
  }

  public async getBarcodeById(id: string): Promise<Barcode | null> {
    return await this.barcodeRepository.getBarcodeById(id);
  }

  public async updateBarcode(
    id: string,
    data?: string,
    quantity?: number,
  ): Promise<Barcode> {
    let barcode = await this.barcodeRepository.getBarcodeById(id);

    if (barcode === null) throw new DomainError('Barcode not found', 404);

    barcode = barcode.update(data, quantity);

    return await this.barcodeRepository.updateBarcode(barcode);
  }

  // Example method to delete a barcode by its ID
  public async deleteBarcode(id: string): Promise<void> {
    await this.barcodeRepository.deleteBarcode(id);
  }

  // Example method to get all barcodes for a specific room with pagination
  public async getRoomBarcodes(
    roomId: string,
    page: number,
    pageSize: number,
  ): Promise<Barcode[]> {
    return await this.barcodeRepository.getRoomBarcodes(roomId, page, pageSize);
  }

  // Example method to export all barcodes for a specific room
  public async exportAllBarcodes(roomId: string): Promise<Barcode[]> {
    return await this.barcodeRepository.exportAllBarcodes(roomId);
  }
}
