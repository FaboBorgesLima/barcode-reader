import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  public id: string | undefined;

  @ApiProperty({ example: 'John Doe' })
  public name: string;

  @ApiProperty({ example: 'john@example.com' })
  public email: string;

  public constructor(id: string | undefined, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  public update(name?: string, email?: string): User {
    const copy = this.copy();
    copy.name = name ?? this.name;
    copy.email = email ?? this.email;
    return copy;
  }

  public copy(): User {
    return new User(this.id, this.name, this.email);
  }
}
