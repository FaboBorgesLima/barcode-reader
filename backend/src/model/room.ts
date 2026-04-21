export class Room {
    public constructor(
        public id: string | undefined,
        public name: string,
        public userId: string,
    ) {}

    public update(name?: string): Room {
        const copy = this.copy();

        copy.name = name ?? this.name;

        return copy;
    }

    public copy(): Room {
        return new Room(this.id, this.name, this.userId);
    }
}
