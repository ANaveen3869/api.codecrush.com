import { match } from "ts-pattern";
export function formatErrorMessages(issues) {
    const errors = {};
    for (const issue of issues) {
        const errorKey = issue.path[issue.path.length - 1];
        const errorMsg = issue.message;
        errors[errorKey] = errorMsg;
    }
    return errors;
}
export function sendErrorResponse(res, statusCode, message, errors) {
    const resData = {
        success: true,
        status: statusCode,
        message,
        errors: errors ?? null
    };
    return res.status(statusCode).json(resData);
}
export function errorResponse(res, errors) {
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
        .with({ statusCode: 400 }, () => {
        return sendErrorResponse(res, 400, errors.message);
    })
        .exhaustive();
}
