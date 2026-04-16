import { BaseExceptions } from "./baseExceptions.js";

export class UnProcessEntityExceptions extends BaseExceptions {
    readonly statusCode =  422;
    message: string;
    errors : unknown;
    constructor(message: string, errors: unknown) {
        super(422, message ?? "Validation failed", errors)
        this.message = message;
        this.statusCode = 422;
        this.errors = errors;
    }
}

