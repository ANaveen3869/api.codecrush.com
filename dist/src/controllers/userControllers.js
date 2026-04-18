import { Result } from "@praha/byethrow";
import { USER_UPDATED } from "../constants/messages";
import { user } from "../database/schemas";
import { BadRequestException, NotFoundExceptions } from "../exceptions";
import { getRecordByPrimaryKey, updateById } from "../services/baseDbServices";
import { errorResponse } from "../utils/errors";
import sendResponse from "../utils/sendResponse";
import { validateRequest } from "../validations/validateRequest";
class UserControllers {
    updateUserByIdHandlers = async (req, res) => {
        const userParamId = req.params.id;
        if (!userParamId || typeof userParamId !== "string") {
            return errorResponse(res, new BadRequestException("Invalid user id"));
        }
        const userId = Number(userParamId);
        if (Number.isNaN(userId)) {
            return errorResponse(res, new BadRequestException("Invalid user id"));
        }
        const reqBody = req.body;
        const result = await Result.pipe(validateRequest("Users:update", reqBody, "User update details do not meet the required validation criteria"), Result.andThen(async (validatedUserData) => {
            const userDataResult = await getRecordByPrimaryKey(user, userId);
            if (Result.isFailure(userDataResult)) {
                return Result.fail(userDataResult.error);
            }
            const userData = userDataResult.value;
            if (!userData) {
                return Result.fail(new NotFoundExceptions(`User not found with id ${userId}`));
            }
            return Result.succeed({ userData, validatedUserData });
        }), Result.andThen(async ({ userData, validatedUserData }) => {
            const updatedUserResult = await updateById(user, userData.id, validatedUserData);
            if (Result.isFailure(updatedUserResult)) {
                return Result.fail(updatedUserResult.error);
            }
            return Result.succeed(updatedUserResult.value[0]);
        }));
        if (Result.isFailure(result)) {
            return errorResponse(res, result.error);
        }
        return sendResponse(res, 200, USER_UPDATED, result.value);
    };
}
export default UserControllers;
