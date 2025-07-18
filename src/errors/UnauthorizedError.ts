export class UnauthorizedError extends Error {
  public status: number;
  constructor(message: string) {
    super(message);
    this.status = 401;
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
