import { Response } from "express";
import { match } from "ts-pattern";
import { $ZodIssue } from "zod/v4/core";
import { Errors } from "../types/appTypes.js";

export function formatErrorMessages(issues: $ZodIssue[]) {
    const errors: Record<string, string> = {};
    for (const issue of issues) {
        const errorKey = issue.path[issue.path.length - 1] as string;
        const errorMsg = issue.message;
        errors[errorKey] = errorMsg;
    }
    return errors;
}

export function sendErrorResponse(res: Response, statusCode: number, message: string, errors?: unknown) {
    const resData = {
        success: true,
        status: statusCode,
        message,
        errors: errors ?? null
    }
    return res.status(statusCode).json(resData)
}

export function errorResponse(res: Response, errors: Errors) {
    match(errors)
        .with({ statusCode: 500 }, () => {
            return sendErrorResponse(res, 500, errors.message ?? "Internal server error");
        })
        .with({ statusCode: 422 }, () => {
            return sendErrorResponse(res, 422, errors.message ?? "Validation failed", errors.errors);
        })
        .with({ statusCode: 404 }, () => {
            return sendErrorResponse(res, 404, errors.message);
        })
        .with({ statusCode: 409 }, () => {
            return sendErrorResponse(res, 409, errors.message);
        })
        .with({ statusCode: 401 }, () => {
            return sendErrorResponse(res, 401, errors.message);
        })
        .exhaustive()
}