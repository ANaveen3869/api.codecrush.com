import { and, getTableName, inArray, isNotNull, isNull, SQL, sql, SQLWrapper } from "drizzle-orm";
import db from "../database/configurations.js";
import { DBRecord, DBTable, InQueryData, OrderByQueryData, SortDirection, WhereQueryData } from "../types/dbTypes.js";

export function buildSelectColumns<T extends DBTable, K extends keyof DBRecord<T>>( table: T, fields?: K[]){
    const selected = {} as Record<K, SQL>;

    if (!Array.isArray(fields) || fields.length === 0) {
        return null;
    }
    fields.forEach((field) => {
        selected[field] = sql.raw(
            `${getTableName(table)}.${String(field)}`
        );
    });

    return selected;
}


export function buildWhereConditions<T extends DBTable>(table: T, whereQueryData?: WhereQueryData<T>) {
    if (!whereQueryData || Object.keys(whereQueryData).length < 1 || whereQueryData.columns.length < 1) {
        return null;
    }
    const { columns, values, relations } = whereQueryData;
    const whereQueries: SQL[] = [];
    const orQueries: SQL[] = [];
    for (let i = 0; i < columns.length; i++) {
        const columnInfo = table[columns[i] as keyof typeof table] as unknown as SQLWrapper;
        const value = values[i];
        const relation = relations?.[i] ?? "=";
        switch (relation) {
            case "=":
                whereQueries.push(sql`${columnInfo} = ${value}`);
                break;

            case "!=":
                whereQueries.push(sql`${columnInfo} != ${value}`);
                break;

            case "<":
                whereQueries.push(sql`${columnInfo} < ${value}`);
                break;

            case "<=":
                whereQueries.push(sql`${columnInfo} <= ${value}`);
                break;

            case ">":
                whereQueries.push(sql`${columnInfo} > ${value}`);
                break;

            case ">=":
                whereQueries.push(sql`${columnInfo} >= ${value}`);
                break;

            case "ILIKE":
                whereQueries.push(sql`${columnInfo} ILIKE ${value}`);
                break;

            case "IS NULL":
                whereQueries.push(isNull(columnInfo));
                break;

            case "IS NOT NULL":
                whereQueries.push(isNotNull(columnInfo));
                break;

            case "contains":
                orQueries.push(sql`${columnInfo} ILIKE ${`%${value}%`}`);
                break;

            case "BETWEEN":
                if (typeof value === "object" && value !== null && "gte" in value && "lte" in value) {
                    whereQueries.push(sql`${columnInfo} BETWEEN ${value.gte} AND ${value.lte}`);
                }
                break;

            case "IN":
                if (Array.isArray(value) && value.length > 0) {
                    whereQueries.push(sql`${columnInfo} IN (${sql.join(value, sql`, `)})`);
                }
                break;
            default:
                break;
        }
    }
    if (orQueries.length > 0) {
        whereQueries.push(sql`(${sql.join(orQueries, sql` OR `)})`);
    }
    return whereQueries;
}

export async function fetchRecords<T extends DBTable, C extends keyof DBRecord<T> = keyof DBRecord<T>>(table: T, filters: SQL | undefined | null, selectedColumns: Record<string, SQL> | null, sortBy: SQL[], additionalCondition: SQL | null, paginationData?: { page: number; pageSize: number }) {
    let query = selectedColumns
        ? db.select(selectedColumns).from(table as DBTable).$dynamic()
        : db.select().from(table as DBTable).$dynamic();

    if (filters && additionalCondition) {
        query = query.where(and(filters, additionalCondition));
    }
    else if (filters) {
        query = query.where(filters);
    }
    else if (additionalCondition) {
        query = query.where(additionalCondition);
    }

    query = query.orderBy(...sortBy);

    if (paginationData) {
        const { page, pageSize } = paginationData;
        query = query.limit(pageSize).offset((page - 1) * pageSize);
    }

    const results = await query;

    if (selectedColumns) {
        return results as Pick<DBRecord<T>, C>[];
    }
    return results as T[];
}

export function parseOrderByQuery<T extends DBTable>(orderBy: string | undefined, defaultColumn: keyof DBRecord<T> = "created_at" , defaultDirection: SortDirection = "desc") {
    let orderByQueryData: OrderByQueryData<T> = {
        columns: [defaultColumn],
        values: [defaultDirection],
    };

    if (!orderBy) {
        return orderByQueryData;
    }

    const orderByColumns: (keyof DBRecord<T>)[] = [];
    const orderByValues: SortDirection[] = [];
    const queryStrings = orderBy.split(",");

    queryStrings.forEach((queryString) => {
        const [column, value] = queryString.split(":");
        orderByColumns.push(column as keyof DBRecord<T>);
        orderByValues.push(value as SortDirection);
    });

    orderByQueryData = {
        columns: orderByColumns,
        values: orderByValues,
    };
    return orderByQueryData;
}


export function buildInConditions<T extends DBTable>(table: T, inQueryData?: InQueryData<T>) {
    if (!inQueryData || (Object.keys(inQueryData).length === 0 && inQueryData.values.length === 0)){
        return null
    }
    const columnInfo = sql.raw(`${getTableName(table)}.${inQueryData.key as string}`);
    const inQuery = inArray(columnInfo, inQueryData.values);
    return inQuery;

}