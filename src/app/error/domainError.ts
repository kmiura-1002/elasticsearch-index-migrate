export class DomainError extends Error {
    constructor(message: string, error?: Error) {
        super(message);
        Object.defineProperty(this, 'name', {
            configurable: true,
            enumerable: false,
            value: this.constructor.name,
            writable: true
        });
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DomainError);
        }
        this.stack = `${this.stack}${error?.stack && `\nCaused by: ${error?.stack}`}`;
    }
}
