import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { dbTables } from "../database/schemas/index.js";

export type DbTablesMap = typeof dbTables;

export type DBTable =  DbTablesMap[keyof DbTablesMap];

export type NewRecord<T extends DBTable> = InferInsertModel<T>;

export type Record<T extends DBTable> = InferSelectModel<T>;


export type Relations = "=" | "!=" | ">" | "<" | ">=" | "<=";