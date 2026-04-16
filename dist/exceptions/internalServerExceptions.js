import { BaseExceptions } from "./baseExceptions.js";
export class InternalServerExceptions extends BaseExceptions {
    statusCode = 500;
    message;
    constructor(message) {
        super(500, message);
        this.message = message;
        this.statusCode = 500;
    }
}
