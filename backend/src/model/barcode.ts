import { ApiProperty } from '@nestjs/swagger';

export class Barcode {
  @ApiProperty({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  public id: string | undefined;

  @ApiProperty({ example: '123456789012' })
  public value: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  public roomId: string;

  @ApiProperty({ example: 1 })
  public quantity: number;

  public constructor(
    id: string | undefined,
    value: string,
    roomId: string,
    quantity: number = 1,
  ) {
    this.id = id;
    this.value = value;
    this.roomId = roomId;
    this.quantity = quantity;
  }

  public update(value?: string, quantity?: number): Barcode {
    const copy = this.copy();
    copy.value = value ?? this.value;
    copy.quantity = quantity ?? this.quantity;
    return copy;
  }

  public copy(): Barcode {
    return new Barcode(this.id, this.value, this.roomId, this.quantity);
  }
}
