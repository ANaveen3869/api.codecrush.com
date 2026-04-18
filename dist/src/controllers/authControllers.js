import { Result } from "@praha/byethrow";
import { TOKEN_GENERATED, USER_CREATED, USER_LOGGED_IN } from "../constants/messages.js";
import { refreshToken } from "../database/schemas/refresh_token.js";
import { user } from "../database/schemas/user.js";
import { ConflictException } from "../exceptions/conflictExceptions.js";
import { InternalServerExceptions } from "../exceptions/internalServerExceptions.js";
import { NotFoundExceptions } from "../exceptions/notFoundExceptions.js";
import { UnAuthorizedException } from "../exceptions/unAuthorizedException.js";
import { findManyByConditions, getOneByColumn, saveRecord, updateById } from "../services/baseDbServices.js";
import { errorResponse } from "../utils/errors.js";
import { genJWTTokensForUser } from "../utils/jwtUtils.js";
import sendResponse from "../utils/sendResponse.js";
import { validateRequest } from "../validations/validateRequest.js";
class AuthControllers {
    createUserHandlers = async (req, res) => {
        const reqBody = req.body;
        const result = await Result.pipe(validateRequest("Users:add", reqBody, "Users add details do not mee the required validation criteria"), Result.andThen((userData) => this.isEmailRegistered(userData)), Result.andThen((userData) => saveRecord(user, userData)));
        if (Result.isFailure(result)) {
            return errorResponse(res, result.error);
        }
        return sendResponse(res, 201, USER_CREATED, result.value);
    };
    getUserByEmailHandlers = async (req, res) => {
        const reqBody = req.body;
        const result = await Result.pipe(validateRequest("Users:login", reqBody, "Users login details do not mee the required validation criteria"), Result.andThen(async (userLogin) => {
            const result = await getOneByColumn(user, "email", userLogin.email);
            if (Result.isFailure(result)) {
                return Result.fail(result.error);
            }
            if (!result.value) {
                return Result.fail(new NotFoundExceptions("Invalid email id"));
            }
            return Result.succeed(result.value);
        }), Result.andThen(async (user) => {
            const tokens = await genJWTTokensForUser(user.id);
            return Result.succeed({ user, ...tokens });
        }), Result.andThen(async (loginData) => {
            await saveRecord(refreshToken, {
                user_id: loginData.user.id,
                refresh_token: loginData.refresh_token,
                expires_at: new Date(loginData.refresh_token_expires_in * 1000)
            });
            return Result.succeed(loginData);
        }));
        if (Result.isFailure(result)) {
            return errorResponse(res, result.error);
        }
        return sendResponse(res, 200, USER_LOGGED_IN, result.value);
    };
    getTokensHandlers = async (req, res) => {
        const reqBody = req.body;
        const user = req.user;
        if (!user) {
            return errorResponse(res, new UnAuthorizedException("User not authenticated"));
        }
        const result = await Result.pipe(validateRequest("Users:refresh-token", reqBody, "Refresh token details do not mee the required validation criteria"), Result.andThen(async (refreshTokenData) => {
            const tokenRecordsResult = await findManyByConditions(refreshToken, ["user_id", "refresh_token"], ["=", "="], [user.id, refreshTokenData.refresh_token]);
            if (Result.isFailure(tokenRecordsResult)) {
                return Result.fail(tokenRecordsResult.error);
            }
            const tokenRecords = tokenRecordsResult.value;
            if (!tokenRecords || tokenRecords.length === 0) {
                return Result.fail(new UnAuthorizedException("Invalid refresh token"));
            }
            return Result.succeed({
                tokenRecord: tokenRecords[0]
            });
        }), Result.andThen(async ({ tokenRecord }) => {
            if (tokenRecord.revoked) {
                return Result.fail(new UnAuthorizedException("Refresh token has been revoked"));
            }
            const now = new Date();
            const expiresAt = new Date(tokenRecord.expires_at);
            if (now > expiresAt) {
                return Result.fail(new UnAuthorizedException("Refresh token has expired"));
            }
            return Result.succeed(tokenRecord);
        }), Result.andThen(async (tokenRecord) => {
            const tokens = await genJWTTokensForUser(tokenRecord.user_id);
            await updateById(refreshToken, tokenRecord.id, { revoked: true });
            await saveRecord(refreshToken, {
                user_id: tokenRecord.user_id,
                refresh_token: tokens.refresh_token,
                expires_at: new Date(tokens.refresh_token_expires_in * 1000)
            });
            return Result.succeed(tokens);
        }));
        if (Result.isFailure(result)) {
            return errorResponse(res, result.error);
        }
        return sendResponse(res, 200, TOKEN_GENERATED, result.value);
    };
    isEmailRegistered(userData) {
        return Result.try({
            async try() {
                const result = await getOneByColumn(user, "email", userData.email, ["id"]);
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
        });
    }
}
export default AuthControllers;
