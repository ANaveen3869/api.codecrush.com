import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { dbTables } from "../database/schemas/index.js";

export type DbTablesMap = typeof dbTables;

export type DBTable =  DbTablesMap[keyof DbTablesMap];
export type DBNewRecord<T extends DBTable> = InferInsertModel<T>;
export type DBRecord<T extends DBTable> = InferSelectModel<T>;

export type Relations = "=" | "!=" | "<" | "<=" | ">" | ">=" | "ILIKE" | "BETWEEN" | "IN" | "IS NULL" | "contains" | "IS NOT NULL" ;
export type SortDirection = "asc" | "desc";

export interface WhereQueryData<T extends DBTable> {
    columns: Array<keyof DBRecord<T>>;
    relations: Array<Relations>;
    values: unknown[];
}

export interface OrderByQueryData<T extends DBTable> {
    columns: Array<keyof DBRecord<T>>;
    values: SortDirection[];
}

export interface InQueryData<T extends DBTable> {
    key: keyof DBRecord<T>;
    values: unknown[];
}

export type UpdateRecordData<T extends DBTable> = Partial<Omit<DBRecord<T>, "id" | "created_at" | "updated_at">>;

export interface PaginationInfo {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
}

export interface PaginatedRecords<T extends DBTable> {
    pagination_info: PaginationInfo;
    records: DBRecord<T>[];
}