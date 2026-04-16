import { boolean, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import timestamps from "./helper.js";
import { user } from "./user.js";
export const refreshToken = pgTable("refresh_token", {
    id: serial().primaryKey(),
    user_id: integer().references(() => user.id).notNull(),
    refresh_token: varchar().notNull(),
    expires_at: timestamp().notNull(),
    revoked: boolean().default(false),
    ...timestamps
});
