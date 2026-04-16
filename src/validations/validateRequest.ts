import { Result } from "@praha/byethrow";
import { infer as Infer, ZodError, ZodSchema } from "zod";
import { InternalServerExceptions } from "../exceptions/internalServerExceptions.js";
import { UnProcessEntityExceptions } from "../exceptions/unProcessEntityExceptions.js";
import { RequestActions } from "../types/appTypes.js";
import { formatErrorMessages } from "../utils/errors.js";
import { vCreateUser, vLoginWithOtp, vRefreshToken, vUpdateUser } from "./schemas/users.js";
 

const actionSchemas = {
    "Users:add": vCreateUser,
    "Users:update" :vUpdateUser,
    "Users:login" : vLoginWithOtp,
    "Users:refresh-token" : vRefreshToken
} satisfies {
    [K in RequestActions]: ZodSchema;
};

export function validateRequest<K extends keyof (typeof actionSchemas)>(actionType : K , data : unknown  , message : string){
    const schema = actionSchemas[actionType];
    return Result.try({
        try(){
            const validatedData = schema.parse(data);
            return validatedData as Infer<(typeof actionSchemas)[K]>
        },
        catch(error){
            if(error instanceof ZodError){
                return new UnProcessEntityExceptions(message , formatErrorMessages(error.issues))
            }
            return new InternalServerExceptions("Internal server error");
        }
    })
}
