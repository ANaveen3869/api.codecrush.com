import { Response } from "express";

function sendResponse(res: Response, statusCode: number, message: string, data?: unknown) {
    const resData = {
        success: true,
        status: statusCode,
        message,
        data: data ?? null
    }
    return res.status(statusCode).json(resData)
}

export default sendResponse;