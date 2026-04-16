import { defineConfig } from "drizzle-kit";
import fs from "fs";
export default defineConfig({
    dialect: "postgresql",
    schema: "./dist/database/schemas/*",
    out: "migrations",
    dbCredentials: {
        url: process.env.DB_URL,
        ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync("./ca.pem").toString(),
        }
    }
});
