import { Result } from "@praha/byethrow";
import { errorResponse } from "../utils/errors";
import { getUserDetailsFromToken } from "../utils/jwtUtils";
export async function isAuthenticated(req, res, next) {
    const result = await getUserDetailsFromToken(req);
    if (Result.isFailure(result)) {
        return errorResponse(res, result.error);
    }
    req.user = result.value;
    return next();
}
