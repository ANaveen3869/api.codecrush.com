import { BaseExceptions } from "./baseExceptions.js";

export class ConflictException extends BaseExceptions {
    readonly statusCode = 409;
    message: string;
    constructor(message: string) {
        super(409, message);
        this.message = message;
        this.statusCode = 409;
    }
}

