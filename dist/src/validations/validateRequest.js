import { Result } from "@praha/byethrow";
import { ZodError } from "zod";
import { InternalServerExceptions } from "../exceptions/internalServerExceptions.js";
import { UnProcessEntityExceptions } from "../exceptions/unProcessEntityExceptions.js";
import { formatErrorMessages } from "../utils/errors.js";
import { vCreateUser, vLoginWithOtp, vRefreshToken, vUpdateUser } from "./schemas/users.js";
const actionSchemas = {
    "Users:add": vCreateUser,
    "Users:update": vUpdateUser,
    "Users:login": vLoginWithOtp,
    "Users:refresh-token": vRefreshToken
};
export function validateRequest(actionType, data, message) {
    const schema = actionSchemas[actionType];
    return Result.try({
        try() {
            const validatedData = schema.parse(data);
            return validatedData;
        },
        catch(error) {
            if (error instanceof ZodError) {
                return new UnProcessEntityExceptions(message, formatErrorMessages(error.issues));
            }
            return new InternalServerExceptions("Internal server error");
        }
    });
}
