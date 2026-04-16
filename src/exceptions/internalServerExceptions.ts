import { BaseExceptions } from "./baseExceptions.js";

export class InternalServerExceptions  extends BaseExceptions {
    readonly statusCode = 500;
    message: string;
    constructor(message : string){
        super(500 , message);
        this.message = message;
        this.statusCode = 500;
    }
}

