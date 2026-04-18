import { BaseExceptions } from "./baseExceptions.js";

export class BadRequestException  extends BaseExceptions {
    readonly statusCode = 400;
    message: string;
    constructor(message : string){
        super(400 , message);
        this.message = message;
        this.statusCode = 400;
    }
}

