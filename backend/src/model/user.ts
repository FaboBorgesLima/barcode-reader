export class User {
    public constructor(
        public id: string | undefined,
        public name: string,
        public email: string,
    ) {}

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
