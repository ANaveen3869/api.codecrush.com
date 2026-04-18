import { Result } from "@praha/byethrow";
import { and, Column, eq, getTableName, sql } from "drizzle-orm";
import db from "../database/configurations.js";
import { InternalServerExceptions } from "../exceptions/internalServerExceptions.js";
import { NotFoundExceptions } from "../exceptions/notFoundExceptions.js";
import { DBNewRecord, DBRecord, DBTable, InQueryData, OrderByQueryData, Relations, UpdateRecordData, WhereQueryData } from "../types/dbTypes.js";
import { buildInConditions, buildSelectColumns, buildWhereConditions, fetchRecords } from "../utils/dbUtils.js";

export function saveRecord<T extends DBTable>(table: T, data: DBNewRecord<T>) {
    return Result.try({
        async try() {
            const newRecord = await db.insert(table).values(data).returning();
            if (!newRecord || !Array.isArray(newRecord)) {
                throw new InternalServerExceptions("Failed to save the data");
            }
            return newRecord[0] as DBRecord<T>;
        }, catch(error) {
            if (error instanceof InternalServerExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        }
    })
}


export async function fetchRecordsWithFilters<T extends DBTable, C extends keyof DBRecord<T> = keyof DBRecord<T>>(table: T, whereQueryData?: WhereQueryData<T>, columnsToSelect?: C[], orderByQueryData?: OrderByQueryData<T>, inQueryData?: InQueryData<T>) {
    const columnsRequired = buildSelectColumns(table, columnsToSelect);
    const whereConditions = buildWhereConditions(table, whereQueryData);
    const inQueryCondition = buildInConditions(table, inQueryData);
    // const orderByConditions = parseOrderByQuery(table, orderByQueryData);

    const whereQuery = whereConditions ? and(...whereConditions) : null;

    const results = await fetchRecords<T, C>(table, whereQuery, columnsRequired, [], inQueryCondition);

    return results;
}

export function getRecordByPrimaryKey<T extends DBTable, S extends keyof DBRecord<T> = keyof DBRecord<T> >(
    table: T, 
    id: number, 
    selectFields?: S[]
) {
    return Result.try({
        async try() {
            const selectedColumns = selectFields?.length ? buildSelectColumns(table, selectFields) : null;
            const result = selectedColumns
                ? await db.select(selectedColumns).from(table as DBTable).where(eq(table.id, id))
                : await db.select().from(table as DBTable).where(eq(table.id, id))
            const row = result[0] ?? null;
            if (!row) return null;
            return selectedColumns
                ? (row as Pick<DBRecord<T>, S>)
                : (row as DBRecord<T>);
        },
        catch() {
            return new InternalServerExceptions("Internal server error");
        }
    })
}

export function getOneByColumn< T extends DBTable, K extends keyof DBRecord<T> , S extends keyof DBRecord<T> = keyof DBRecord<T>>(
    table: T,
    column: K,
    value: DBRecord<T>[K],
    selectFields?: S[]
) {
    return Result.try({
        async try() {
            const selectedColumns = selectFields?.length ? buildSelectColumns(table, selectFields) : null;
            const result = selectedColumns
                ? await db.select(selectedColumns).from(table as DBTable).where(eq(table[column] as Column, value))
                : await db.select().from(table as DBTable).where(eq(table[column] as Column, value));
            const row = result[0] ?? null;
            if (!row) return null;
            return selectedColumns
                ? (row as Pick<DBRecord<T>, S>)
                : (row as DBRecord<T>);
        }, catch() {
            return new InternalServerExceptions("Internal server error");
        }
    })
}

export function findManyByConditions<
    T extends DBTable,
    K extends keyof DBRecord<T>,
    S extends keyof DBRecord<T> = keyof DBRecord<T>
>(
    table: T,
    columns: K[],
    relations: Relations[],
    values: DBRecord<T>[K][],
    selectFields?: S[]
) {
    const whereQueryData: WhereQueryData<T> = {
        columns,
        relations,
        values,
    };

    return Result.try({
        async try() {
            const selectedColumns = selectFields?.length ? buildSelectColumns(table, selectFields) : null;
            const whereConditions = buildWhereConditions( table, whereQueryData);
            const whereClause = whereConditions ? and(...whereConditions) : undefined;

            const result = selectedColumns
                ? await db.select(selectedColumns).from(table as DBTable).where(whereClause)
                : await db.select().from(table as DBTable).where(whereClause);

            return selectedColumns
                ? (result as Pick<DBRecord<T>, S>[])
                : (result as DBRecord<T>[]);
        },
        catch() {
            return new InternalServerExceptions("Internal server error");
        },
    });
}

export function saveRecords<T extends DBTable>(table: T, data: DBNewRecord<T>[]) {
    return Result.try({
        async try() {
            const newRecords = await db.insert(table).values(data);
            if (!newRecords || !Array.isArray(newRecords)) {
                throw new InternalServerExceptions("Failed to save the data");
            }
            return newRecords as DBRecord<T>[];
        }, catch(error) {
            if (error instanceof InternalServerExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        }
    })
}

export function updateById<T extends DBTable>(table: T, id: number, record: UpdateRecordData<T>){
     return Result.try({
        async try() {
            const columnInfo = sql.raw(`${getTableName(table)}.id`);
            const result = await db
                .update(table)
                .set(record as any)
                .where(eq(columnInfo, id))
                .returning();

            return result;
        },
        catch() {
            return new InternalServerExceptions("Internal server error");
        }
    })
}

export function deleteById<T extends DBTable>(table: T, id: number) {
    return Result.try(({
        async try() {
            const result = await db.delete(table).where(eq(table.id, id)).returning();
            if (result.length === 0) {
                throw new NotFoundExceptions(`Record with id ${id} not found`);
            }
            return result[0] as DBRecord<T>
        }, catch(error) {
            if (error instanceof NotFoundExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        },
    }))
}

export async function deleteByColumn<T extends DBTable, C extends keyof DBRecord<T>>(table: T, column: C, value: unknown) {
    return Result.try({
        async try(){
            const columnInfo = sql.raw(`${getTableName(table)}.${column as string}`);
            const deletedRecord = await db.delete(table).where(eq(columnInfo, value)).returning();
            if (deletedRecord.length === 0) {
                throw new NotFoundExceptions(`Record with ${column} ${value} not found`);
            }
            return deletedRecord[0] as DBRecord<T>;
        },
        catch(error) {
            if (error instanceof NotFoundExceptions) {
                return error;
            }
            return new InternalServerExceptions("Internal server error");
        },
    })
}

export async function softDeleteById<T extends DBTable>(table: T, id: number, record: UpdateRecordData<T>) {
    return Result.try({
        async try() {
            const columnInfo = sql.raw(`${getTableName(table)}.id`);
            const result = await db
                .update(table)
                .set(record as any)
                .where(eq(columnInfo, id))
                .returning();

            return result;
        },
        catch() {
            return new InternalServerExceptions("Internal server error");
        }
    })
}