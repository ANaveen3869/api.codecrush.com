import { Result } from "@praha/byethrow";
import { USER_CREATED } from "../constants/messages.js";
import { user } from "../database/schemas/user.js";
import { ConflictException } from "../exceptions/conflictExceptions.js";
import { InternalServerExceptions } from "../exceptions/internalServerExceptions.js";
import { getRecordBySingleColumnName, saveRecord } from "../services/baseDbServices.js";
import { errorResponse } from "../utils/errors.js";
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
    isEmailRegistered(userData) {
        return Result.try({
            async try() {
                const result = await getRecordBySingleColumnName(user, "email", userData);
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
