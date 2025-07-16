export class ConflictError extends Error {
  public status: number;
  constructor(message: string) {
    super(message);
    this.status = 409;
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
