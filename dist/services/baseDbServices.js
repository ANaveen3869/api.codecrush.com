import { Result } from "@praha/byethrow";
import { eq, getTableName, sql } from "drizzle-orm";
import db from "../database/configurations.js";
import { InternalServerExceptions } from "../exceptions/internalServerExceptions.js";
import { createColumnSelectors } from "../utils/dbUtils.js";
export function saveRecord(table, data) {
    return Result.try({
        async try() {
            const newRecord = await db.insert(table).values(data);
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
            const selectedColumns = createColumnSelectors(table, columnsToSelect);
            const record = await db.select(selectedColumns).from(table).where(eq(table.id, id));
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
export function getRecordBySingleColumnName(table, column, value, columnsToSelect = []) {
    return Result.try({
        async try() {
            const selectedColumns = createColumnSelectors(table, columnsToSelect);
            const columnInfo = sql.raw(`${getTableName(table)}.${String(column)}`);
            const record = await db.select(selectedColumns).from(table).where(eq(columnInfo, value));
            return record[0];
        }, catch(_) {
            return new InternalServerExceptions("Internal server error");
        }
    });
}
export function getRecordByMultipleColumnNames(table, column, relations, values) {
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
