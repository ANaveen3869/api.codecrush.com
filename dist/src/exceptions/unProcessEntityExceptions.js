import { BaseExceptions } from "./baseExceptions.js";
export class UnProcessEntityExceptions extends BaseExceptions {
    statusCode = 422;
    message;
    errors;
    constructor(message, errors) {
        super(422, message ?? "Validation failed", errors);
        this.message = message;
        this.statusCode = 422;
        this.errors = errors;
    }
}
