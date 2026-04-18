import { Result } from "@praha/byethrow";
import { and, eq, getTableName, sql } from "drizzle-orm";
import db from "../database/configurations.js";
import { InternalServerExceptions } from "../exceptions/internalServerExceptions.js";
import { NotFoundExceptions } from "../exceptions/notFoundExceptions.js";
import { buildInConditions, buildSelectColumns, buildWhereConditions, fetchRecords } from "../utils/dbUtils.js";
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
export async function fetchRecordsWithFilters(table, whereQueryData, columnsToSelect, orderByQueryData, inQueryData) {
    const columnsRequired = buildSelectColumns(table, columnsToSelect);
    const whereConditions = buildWhereConditions(table, whereQueryData);
    const inQueryCondition = buildInConditions(table, inQueryData);
    // const orderByConditions = parseOrderByQuery(table, orderByQueryData);
    const whereQuery = whereConditions ? and(...whereConditions) : null;
    const results = await fetchRecords(table, whereQuery, columnsRequired, [], inQueryCondition);
    return results;
}
export function getRecordByPrimaryKey(table, id, selectFields) {
    return Result.try({
        async try() {
            const selectedColumns = selectFields?.length ? buildSelectColumns(table, selectFields) : null;
            const result = selectedColumns
                ? await db.select(selectedColumns).from(table).where(eq(table.id, id))
                : await db.select().from(table).where(eq(table.id, id));
            const row = result[0] ?? null;
            if (!row)
                return null;
            return selectedColumns
                ? row
                : row;
        },
        catch() {
            return new InternalServerExceptions("Internal server error");
        }
    });
}
export function getOneByColumn(table, column, value, selectFields) {
    return Result.try({
        async try() {
            const selectedColumns = selectFields?.length ? buildSelectColumns(table, selectFields) : null;
            const result = selectedColumns
                ? await db.select(selectedColumns).from(table).where(eq(table[column], value))
                : await db.select().from(table).where(eq(table[column], value));
            const row = result[0] ?? null;
            if (!row)
                return null;
            return selectedColumns
                ? row
                : row;
        }, catch() {
            return new InternalServerExceptions("Internal server error");
        }
    });
}
export function findManyByConditions(table, columns, relations, values, selectFields) {
    const whereQueryData = {
        columns,
        relations,
        values,
    };
    return Result.try({
        async try() {
            const selectedColumns = selectFields?.length ? buildSelectColumns(table, selectFields) : null;
            const whereConditions = buildWhereConditions(table, whereQueryData);
            const whereClause = whereConditions ? and(...whereConditions) : undefined;
            const result = selectedColumns
                ? await db.select(selectedColumns).from(table).where(whereClause)
                : await db.select().from(table).where(whereClause);
            return selectedColumns
                ? result
                : result;
        },
        catch() {
            return new InternalServerExceptions("Internal server error");
        },
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
export function updateById(table, id, record) {
    return Result.try({
        async try() {
            const columnInfo = sql.raw(`${getTableName(table)}.id`);
            const result = await db
                .update(table)
                .set(record)
                .where(eq(columnInfo, id))
                .returning();
            return result;
        },
        catch() {
            return new InternalServerExceptions("Internal server error");
        }
    });
}
export function deleteById(table, id) {
    return Result.try(({
        async try() {
            const result = await db.delete(table).where(eq(table.id, id)).returning();
            if (result.length === 0) {
                throw new NotFoundExceptions(`Record with id ${id} not found`);
            }
            return result[0];
        }, catch(error) {
            if (error instanceof NotFoundExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        },
    }));
}
export async function deleteByColumn(table, column, value) {
    return Result.try({
        async try() {
            const columnInfo = sql.raw(`${getTableName(table)}.${column}`);
            const deletedRecord = await db.delete(table).where(eq(columnInfo, value)).returning();
            if (deletedRecord.length === 0) {
                throw new NotFoundExceptions(`Record with ${column} ${value} not found`);
            }
            return deletedRecord[0];
        },
        catch(error) {
            if (error instanceof NotFoundExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        },
    });
}
export async function softDeleteById(table, id, record) {
    return Result.try({
        async try() {
            const columnInfo = sql.raw(`${getTableName(table)}.id`);
            const result = await db
                .update(table)
                .set(record)
                .where(eq(columnInfo, id))
                .returning();
            return result;
        },
        catch() {
            return new InternalServerExceptions("Internal server error");
        }
    });
}
