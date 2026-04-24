import { Injectable } from '@nestjs/common';
import { Barcode } from '../../model/barcode';
import { BarcodeRepository } from '../../repository/barcodeRepository';
import { PrismaService } from '../prisma/prismaService';

@Injectable()
export class PrismaBarcodeRepository implements BarcodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private map(row: {
    id: string;
    value: string;
    roomId: string;
    quantity: number;
  }): Barcode {
    return new Barcode(row.id, row.value, row.roomId, row.quantity);
  }

  async getBarcodeById(id: string): Promise<Barcode | null> {
    const row = await this.prisma.barcode.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async createBarcode(barcode: Barcode): Promise<Barcode> {
    const row = await this.prisma.barcode.create({
      data: {
        value: barcode.value,
        roomId: barcode.roomId,
        quantity: barcode.quantity,
      },
    });
    return this.map(row);
  }

  async updateBarcode(barcode: Barcode): Promise<Barcode> {
    const row = await this.prisma.barcode.update({
      where: { id: barcode.id },
      data: { value: barcode.value, quantity: barcode.quantity },
    });
    return this.map(row);
  }

  async deleteBarcode(id: string): Promise<void> {
    await this.prisma.barcode.delete({ where: { id } });
  }

  async getRoomBarcodes(
    roomId: string,
    page: number,
    pageSize: number,
  ): Promise<Barcode[]> {
    const rows = await this.prisma.barcode.findMany({
      where: { roomId },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return rows.map((r) => this.map(r));
  }

  async exportAllBarcodes(roomId: string): Promise<Barcode[]> {
    const rows = await this.prisma.barcode.findMany({ where: { roomId } });
    return rows.map((r) => this.map(r));
  }

  async countBarcodes(roomId: string): Promise<number> {
    return this.prisma.barcode.count({ where: { roomId } });
  }
}
