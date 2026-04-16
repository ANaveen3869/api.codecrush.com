import { Result } from "@praha/byethrow";
import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/errors";
import { getUserDetailsFromToken } from "../utils/jwtUtils";

export async function isAuthenticated(req: Request, res: Response , next : NextFunction) {
    const result = await getUserDetailsFromToken(req);
    if (Result.isFailure(result)) {
        return errorResponse(res , result.error); 
    }
    // req.user = result.value;
    next();
}