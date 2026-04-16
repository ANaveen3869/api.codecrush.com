import { BaseExceptions } from "./baseExceptions.js";
export class UnAuthorizedException extends BaseExceptions {
    statusCode = 401;
    message;
    constructor(message) {
        super(401, message);
        this.message = message;
        this.statusCode = 401;
    }
}
