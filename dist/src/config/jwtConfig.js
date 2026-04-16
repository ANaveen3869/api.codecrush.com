import envData from "../env";
export const jwtConfig = {
    secret: envData.JWT_SECRET_KEY,
    expires_in: 60 * 60 * 24 * 7 // 7 days
};
