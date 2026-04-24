export class Otp {
  public constructor(
    public id: string | undefined,
    public email: string,
    public hashedCode: string,
    public expiresAt: Date,
    public used: boolean,
  ) {}

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isValid(): boolean {
    return !this.used && !this.isExpired();
  }
}
