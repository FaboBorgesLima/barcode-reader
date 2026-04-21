export class Barcode {
    public constructor(
        public id: string | undefined,
        public value: string,
        public roomId: string,
        public quantity: number = 1,
    ) {}

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
