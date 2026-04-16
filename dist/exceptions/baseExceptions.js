export class BaseExceptions extends Error {
    statusCode;
    message;
    errors;
    constructor(statusCode, message, errors) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
