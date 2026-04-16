import { BaseExceptions } from "./baseExceptions.js";
export class ConflictException extends BaseExceptions {
    statusCode = 409;
    message;
    constructor(message) {
        super(409, message);
        this.message = message;
        this.statusCode = 409;
    }
}
