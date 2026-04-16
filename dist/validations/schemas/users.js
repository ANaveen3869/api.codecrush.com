import { z } from "zod";
export const vCreateUser = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().nullish(),
    is_phone_verified: z.boolean(),
    is_email_verified: z.boolean(),
    address: z.string()
});
export const vUpdateUser = z.object({
    name: z.string().nullish(),
    email: z.string().nullish(),
    phone: z.string().nullish(),
    address: z.string().nullish(),
});
