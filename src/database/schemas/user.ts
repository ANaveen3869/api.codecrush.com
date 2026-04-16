import { boolean, index, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import timestamps from "./helper.js";

export const user = pgTable("user",{
    id : serial().primaryKey(),
    name : varchar().notNull(),
    email : varchar().notNull(),
    is_email_verified: boolean().default(false),
    address : text(),
    phone: varchar(),
    is_phone_verified: boolean().default(false),
    ...timestamps
} , t => [
    index("user_name_idx").on(t.name),
    index("user_email_idx").on(t.email)
])

export type UserTable = typeof user;
export type NewUser = typeof user.$inferInsert;
export type User = typeof user.$inferSelect;