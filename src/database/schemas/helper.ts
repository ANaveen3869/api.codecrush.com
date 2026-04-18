import { timestamp } from "drizzle-orm/pg-core";

const timestamps = {
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
    deleted_at: timestamp("deleted_at"),
} as const;

export default timestamps;