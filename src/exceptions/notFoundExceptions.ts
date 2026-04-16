import { BaseExceptions } from "./baseExceptions.js";

export class NotFoundExceptions extends BaseExceptions {
    readonly statusCode = 404;
    message: string;
    constructor(message : string){
            super(404 , message);
            this.message = message;
            this.statusCode = 404;
    }

}
