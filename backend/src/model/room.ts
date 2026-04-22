import { ApiProperty } from '@nestjs/swagger';

export class Room {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  public id: string | undefined;

  @ApiProperty({ example: 'Warehouse A' })
  public name: string;

  @ApiProperty({ example: 'u1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  public userId: string;

  public constructor(id: string | undefined, name: string, userId: string) {
    this.id = id;
    this.name = name;
    this.userId = userId;
  }

  public update(name?: string): Room {
    const copy = this.copy();

    copy.name = name ?? this.name;

    return copy;
  }

  public copy(): Room {
    return new Room(this.id, this.name, this.userId);
  }
}
