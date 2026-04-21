export class DomainError extends Error {
    public constructor(
        message: string,
        public code: number,
    ) {
        super(message);
        this.name = "DomainError";
    }
}
