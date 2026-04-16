import { BaseExceptions } from "./baseExceptions.js";
export class NotFoundExceptions extends BaseExceptions {
    statusCode = 404;
    message;
    constructor(message) {
        super(404, message);
        this.message = message;
        this.statusCode = 404;
    }
}
