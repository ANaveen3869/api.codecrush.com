import * as z from "zod/mini";
const envSchema = z.object({
    NODE_ENV: z.string(),
    PORT: z.coerce.number(),
    JWT_SECRET_KEY: z.string(),
    DB_URL: z.string(),
});
let envData;
try {
    envData = z.parse(envSchema, process.env);
}
catch (error) {
    throw new Error("Error");
}
export default envData;
