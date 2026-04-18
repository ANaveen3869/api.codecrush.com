import type {
    ConflictException,
    InternalServerExceptions,
    NotFoundExceptions,
    UnAuthorizedException,
    UnProcessEntityExceptions
} from "../exceptions/index.js";

export type RequestActions = "Users:add" | "Users:update" | "Users:login" | "Users:refresh-token"

export type Errors =
    | InternalServerExceptions
    | NotFoundExceptions
    | UnProcessEntityExceptions
    | ConflictException
    | UnAuthorizedException;

export interface JwtPayload {
    sub : string
    iat : number
}
