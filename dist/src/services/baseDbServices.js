import { Result } from "@praha/byethrow";
import { eq } from "drizzle-orm";
import db from "../database/configurations.js";
import { InternalServerExceptions } from "../exceptions/internalServerExceptions.js";
import { prepareSelectColumnsForQuery } from "../utils/dbUtils.js";
export function saveRecord(table, data) {
    return Result.try({
        async try() {
            const newRecord = await db.insert(table).values(data).returning();
            if (!newRecord || !Array.isArray(newRecord)) {
                throw new InternalServerExceptions("Failed to save the data");
            }
            return newRecord[0];
        }, catch(error) {
            if (error instanceof InternalServerExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        }
    });
}
export function getRecordByPrimaryKey(table, id, columnsToSelect = []) {
    return Result.try({
        async try() {
            const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect);
            const record = Object.keys(columnsRequired).length > 0
                ? await db.select(columnsRequired).from(table).where(eq(table.id, id))
                : await db.select().from(table).where(eq(table.id, id));
            if (!record[0]) {
                return null;
            }
            return record[0];
        },
        catch(_) {
            return new InternalServerExceptions("Internal server error");
        }
    });
}
export function getSingleRecordByAColumnValue(table, column, value, columnsToSelect = []) {
    return Result.try({
        async try() {
            const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect);
            const record = Object.keys(columnsRequired).length > 0
                ? await db.select(columnsRequired).from(table).where(eq(table[column], value))
                : await db.select().from(table).where(eq(table[column], value));
            return record[0] ? record[0] : null;
        }, catch(_) {
            return new InternalServerExceptions("Internal server error");
        }
    });
}
export function getMultipleRecordsByMultipleColumnValues(table, column, relations, values) {
    return Result.try({
        async try() {
        }, catch() {
        }
    });
}
export function saveRecords(table, data) {
    return Result.try({
        async try() {
            const newRecords = await db.insert(table).values(data);
            if (!newRecords || !Array.isArray(newRecords)) {
                throw new InternalServerExceptions("Failed to save the data");
            }
            return newRecords;
        }, catch(error) {
            if (error instanceof InternalServerExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        }
    });
}
