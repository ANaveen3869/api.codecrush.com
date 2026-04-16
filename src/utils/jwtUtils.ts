import { Result } from "@praha/byethrow";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwtConfig";
import { user } from "../database/schemas";
import { InternalServerExceptions, NotFoundExceptions, UnAuthorizedException } from "../exceptions";
import { getRecordByPrimaryKey } from "../services/baseDbServices";
import { JwtPayload } from "../types/appTypes";

const { JsonWebTokenError, TokenExpiredError, sign, verify } = jwt;

async function genJWTTokens(payload: JwtPayload) {
    const now = Math.floor(Date.now() / 1000);
    const access_token_expiry = now + jwtConfig.expires_in;
    const refresh_token_expiry = now + (jwtConfig.expires_in * 3);

    const [access_token, refresh_token] = await Promise.all(
        [
            sign({ ...payload, exp: access_token_expiry }, jwtConfig.secret),
            sign({ ...payload, exp: refresh_token_expiry }, jwtConfig.secret)
        ]);

    return { access_token, refresh_token , refresh_token_expires_in : refresh_token_expiry};
}

export async function genJWTTokensForUser(userId: number) {
    const payload: JwtPayload = {
        sub: String(userId),
        iat: Math.floor(Date.now() / 1000),
    };
    return await genJWTTokens(payload);
}


function verifyJWTToken(token: string) {
    return Result.try({
        try() {
            const decodedPayload = verify(token, jwtConfig.secret);
            if (typeof decodedPayload === "string") {
                throw new UnAuthorizedException("Invalid token")
            }
            return decodedPayload;
        },
        catch(error) {
            if (error instanceof TokenExpiredError) {
                return new UnAuthorizedException("Token is expired");
            }
            if (error instanceof JsonWebTokenError) {
                return new UnAuthorizedException("Invalid token");
            }
            if (error instanceof UnAuthorizedException) {
                return new UnAuthorizedException("Invalid token");
            }
            return new InternalServerExceptions("Internal server error");
        }
    })
}


export async function getUserDetailsFromToken(req: Request) {
    return Result.try({
        async try() {
            const authHeader = req.headers["authorization"]
            if (!authHeader) {
                throw new UnAuthorizedException("Token is required");
            }
            if (!authHeader.startsWith("Bearer ")) {
                throw new UnAuthorizedException("Invalid token");
            }
            const token = authHeader.substring(7);
            const decodedPayload = verifyJWTToken(token);
            if (Result.isFailure(decodedPayload)) {
                throw decodedPayload.error
            }
            const jwtPayload = decodedPayload.value as JwtPayload;
            const userId = Number(jwtPayload.sub);

            if (!jwtPayload.sub || Number.isNaN(userId)) {
                throw new UnAuthorizedException("Invalid token");
            }
            const userDataResult = await getRecordByPrimaryKey(user, userId);
            if (Result.isFailure(userDataResult)) {
                throw userDataResult.error;
            }
            const userData = userDataResult.value;
            if (!userData) {
                throw new NotFoundExceptions("User not found");
            }
            return userData
        },
        catch(error) {
            if (error instanceof UnAuthorizedException) {
                return error
            }
            if (error instanceof NotFoundExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        }
    })
}