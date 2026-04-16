import { Result } from "@praha/byethrow";
import { Column, eq, Relations } from "drizzle-orm";
import db from "../database/configurations.js";
import { InternalServerExceptions } from "../exceptions/internalServerExceptions.js";
import { DBTable, NewRecord, Record } from "../types/dbTypes.js";
import { prepareSelectColumnsForQuery } from "../utils/dbUtils.js";

export function saveRecord<T extends DBTable>(table: T, data: NewRecord<T>) {
    return Result.try({
        async try() {
            const newRecord = await db.insert(table).values(data).returning();
            if (!newRecord || !Array.isArray(newRecord)) {
                throw new InternalServerExceptions("Failed to save the data");
            }
            return newRecord[0] as Record<T>;
        }, catch(error) {
            if (error instanceof InternalServerExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        }
    })
}

export function getRecordByPrimaryKey<T extends DBTable, K extends keyof T["_"]["columns"]>(table: T, id: number, columnsToSelect: K[] = []) {
    return Result.try({
        async try() {
            const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect)
            const record = Object.keys(columnsRequired).length > 0
                ? await db.select(columnsRequired).from(table as DBTable).where(eq(table.id, id))
                : await db.select().from(table as DBTable).where(eq(table.id, id))
            if (!record[0]) {
                return null;
            }
            return record[0] as Record<T>
        },
        catch(_) {
            return new InternalServerExceptions("Internal server error");
        }
    })
}

export function getSingleRecordByAColumnValue<T extends DBTable, K extends keyof T["_"]["columns"]>(table: T, column: K, value: unknown, columnsToSelect: K[] = []) {
    return Result.try({
        async try() {
            const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect)
            const record = Object.keys(columnsRequired).length > 0
                ? await db.select(columnsRequired).from(table as DBTable).where(eq(table[column] as Column, value))
                : await db.select().from(table as DBTable).where(eq(table[column] as Column, value));
            return record[0] ? record[0] as Record<T> : null;
        }, catch(_) {
            return new InternalServerExceptions("Internal server error");
        }
    })
}

export function getMultipleRecordsByMultipleColumnValues<T extends DBTable, K extends keyof T["_"]["columns"]>(table: T, column: K[], relations: Relations[], values: unknown[]) {
    return Result.try({
        async try(){

        },catch(){

        }
    })
}

export function saveRecords<T extends DBTable>(table: T, data: NewRecord<T>[]) {
    return Result.try({
        async try() {
            const newRecords = await db.insert(table).values(data);
            if (!newRecords || !Array.isArray(newRecords)) {
                throw new InternalServerExceptions("Failed to save the data");
            }
            return newRecords as Record<T>[];
        }, catch(error) {
            if (error instanceof InternalServerExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        }
    })
}