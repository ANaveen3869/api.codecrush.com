import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import timestamps from "./helper.js";
import { user } from "./user.js";
export const refreshToken = pgTable("refresh_token", {
    id: serial().primaryKey(),
    user_id: integer().references(() => user.id),
    refresh_token: varchar().notNull(),
    ...timestamps
});
