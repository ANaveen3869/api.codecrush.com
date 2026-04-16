function sendResponse(res, statusCode, message, data) {
    const resData = {
        success: true,
        status: statusCode,
        message,
        data: data ?? null
    };
    return res.status(statusCode).json(resData);
}
export default sendResponse;
