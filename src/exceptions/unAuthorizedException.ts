import { BaseExceptions } from "./baseExceptions.js";

export class UnAuthorizedException extends BaseExceptions {
    readonly statusCode = 401;
    message: string;
    constructor(message : string){
            super(401 , message);
            this.message = message;
            this.statusCode = 401;
    }

}
