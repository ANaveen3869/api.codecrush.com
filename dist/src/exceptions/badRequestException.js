import { BaseExceptions } from "./baseExceptions.js";
export class BadRequestException extends BaseExceptions {
    statusCode = 400;
    message;
    constructor(message) {
        super(400, message);
        this.message = message;
        this.statusCode = 400;
    }
}
