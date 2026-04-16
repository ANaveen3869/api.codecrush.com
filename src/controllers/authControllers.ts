import { Result } from "@praha/byethrow";
import { Request, Response } from "express";
import { TOKEN_GENERATED, USER_CREATED, USER_LOGGED_IN } from "../constants/messages.js";
import { refreshToken } from "../database/schemas/refresh_token.js";
import { user } from "../database/schemas/user.js";
import { ConflictException } from "../exceptions/conflictExceptions.js";
import { InternalServerExceptions } from "../exceptions/internalServerExceptions.js";
import { NotFoundExceptions } from "../exceptions/notFoundExceptions.js";
import { getSingleRecordByAColumnValue, saveRecord } from "../services/baseDbServices.js";
import { errorResponse } from "../utils/errors.js";
import { genJWTTokensForUser } from "../utils/jwtUtils.js";
import sendResponse from "../utils/sendResponse.js";
import { ValidatedCreateUser } from "../validations/schemas/users.js";
import { validateRequest } from "../validations/validateRequest.js";

class AuthControllers {
    createUserHandlers = async (req: Request, res: Response) => {
        const reqBody = req.body;
        const result = await Result.pipe(
            validateRequest("Users:add", reqBody, "Users add details do not mee the required validation criteria"),
            Result.andThen((userData) => this.isEmailRegistered(userData)),
            Result.andThen((userData) => saveRecord(user, userData))
        )
        if (Result.isFailure(result)) {
            return errorResponse(res, result.error);
        }
        return sendResponse(res, 201, USER_CREATED, result.value);
    };
    getUserByEmailHandlers = async (req: Request, res: Response) => {
        const reqBody = req.body;
        const result = await Result.pipe(
            validateRequest("Users:login", reqBody, "Users login details do not mee the required validation criteria"),
            Result.andThen(async (userLogin)=>{
                const result = await getSingleRecordByAColumnValue(user, "email", userLogin.email);
                if (Result.isFailure(result)) {
                    throw result.error;
                }
                if(!result.value){
                    return Result.fail(new NotFoundExceptions("Invalid email id"))
                }
                return Result.succeed(result.value);
            }),
            Result.andThen( async (user)=> {
                const tokens = await genJWTTokensForUser(user.id);
                return Result.succeed({ user, ...tokens})
            }),
            Result.andThen(async (loginData)=> {
                await saveRecord(refreshToken , {
                    user_id : loginData.user.id,
                    refresh_token : loginData.refresh_token,
                    expires_at: new Date(loginData.refresh_token_expires_in * 1000)
                })
                return Result.succeed(loginData);   
            })
        )
        if (Result.isFailure(result)) {
            return errorResponse(res, result.error);
        }
        return sendResponse(res, 200, USER_LOGGED_IN, result.value)
    }

    getTokensByRefreshTokensHandlers = async(req : Request , res : Response)=>{
        const reqBody = req.body;
        const result = Result.pipe(
            validateRequest("Users:refresh-token", reqBody, "Refresh token details do not mee the required validation criteria"),
            Result.andThen((refreshTokenData)=>{
                return Result.succeed(refreshTokenData)
            })
        )
        if (Result.isFailure(result)) {
            return errorResponse(res, result.error);
        }
        return sendResponse(res, 200, TOKEN_GENERATED, result.value)
    }

    isEmailRegistered(userData: ValidatedCreateUser) {
        return Result.try({
            async try() {
                const result = await getSingleRecordByAColumnValue(user, "email", userData.email , ["id"] );
                if (Result.isFailure(result)) {
                    throw result.error;
                }
                if (result.value) {
                    throw new ConflictException("User already existed");
                }
                return userData;
            }, catch(error) {
                if (error instanceof ConflictException) {
                    return error;
                }
                return new InternalServerExceptions("Internal Server error");
            }
        })
    }
    isValidRefreshToken(refreshToken : string){
        return Result.try({
            async try(){
                
            },catch(){

            }
        })
    }
}

export default AuthControllers;