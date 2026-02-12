export class DataAccessError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DataAccessError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}
