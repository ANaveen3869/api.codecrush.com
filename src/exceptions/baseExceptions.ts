export class BaseExceptions extends Error {
    readonly statusCode ;
    message : string;
    errors : unknown;
    constructor(statusCode : number , message : string , errors? : unknown ){
        super(message);
        this.message = message  
        this.statusCode = statusCode
        this.errors = errors   
    }
}
