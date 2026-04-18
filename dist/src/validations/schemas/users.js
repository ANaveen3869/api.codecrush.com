import { z } from "zod";
export const vCreateUser = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().nullish(),
    is_phone_verified: z.boolean().nullish(),
    is_email_verified: z.boolean().nullish(),
    address: z.string().nullish()
});
export const vUpdateUser = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().nullish(),
    address: z.string().nullish(),
});
export const vLoginWithOtp = z.object({
    email: z.email("Invalid email format"),
    otp: z.string().min(4).max(8),
});
export const vRefreshToken = z.object({
    refresh_token: z.string(),
});
