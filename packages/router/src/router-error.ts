/**
 * Router Error
 */
export class RouterError extends Error {

  readonly code: number;
  readonly data: any;

  constructor(message: string, code: number, data?: any) {
    super(message);
    this.code = code;
    this.data = data;
  }

  static from(error: Error, code: number, data?: any): RouterError {
    if (error instanceof RouterError) {
      return error;
    }
    let routerError = new RouterError(error.message, code, data);
    routerError.stack = error.stack;
    return routerError;
  }

  getMessage() {
    return this.message;
  }

  getData() {
    return this.data;
  }

  getCode() {
    return this.code;
  }
}
