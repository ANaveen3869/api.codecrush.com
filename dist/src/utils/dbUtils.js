import { and, getTableName, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import db from "../database/configurations.js";
export function buildSelectColumns(table, fields) {
    const selected = {};
    if (!Array.isArray(fields) || fields.length === 0) {
        return null;
    }
    fields.forEach((field) => {
        selected[field] = sql.raw(`${getTableName(table)}.${String(field)}`);
    });
    return selected;
}
export function buildWhereConditions(table, whereQueryData) {
    if (!whereQueryData || Object.keys(whereQueryData).length < 1 || whereQueryData.columns.length < 1) {
        return null;
    }
    const { columns, values, relations } = whereQueryData;
    const whereQueries = [];
    const orQueries = [];
    for (let i = 0; i < columns.length; i++) {
        const columnInfo = table[columns[i]];
        const value = values[i];
        const relation = relations?.[i] ?? "=";
        switch (relation) {
            case "=":
                whereQueries.push(sql `${columnInfo} = ${value}`);
                break;
            case "!=":
                whereQueries.push(sql `${columnInfo} != ${value}`);
                break;
            case "<":
                whereQueries.push(sql `${columnInfo} < ${value}`);
                break;
            case "<=":
                whereQueries.push(sql `${columnInfo} <= ${value}`);
                break;
            case ">":
                whereQueries.push(sql `${columnInfo} > ${value}`);
                break;
            case ">=":
                whereQueries.push(sql `${columnInfo} >= ${value}`);
                break;
            case "ILIKE":
                whereQueries.push(sql `${columnInfo} ILIKE ${value}`);
                break;
            case "IS NULL":
                whereQueries.push(isNull(columnInfo));
                break;
            case "IS NOT NULL":
                whereQueries.push(isNotNull(columnInfo));
                break;
            case "contains":
                orQueries.push(sql `${columnInfo} ILIKE ${`%${value}%`}`);
                break;
            case "BETWEEN":
                if (typeof value === "object" && value !== null && "gte" in value && "lte" in value) {
                    whereQueries.push(sql `${columnInfo} BETWEEN ${value.gte} AND ${value.lte}`);
                }
                break;
            case "IN":
                if (Array.isArray(value) && value.length > 0) {
                    whereQueries.push(sql `${columnInfo} IN (${sql.join(value, sql `, `)})`);
                }
                break;
            default:
                break;
        }
    }
    if (orQueries.length > 0) {
        whereQueries.push(sql `(${sql.join(orQueries, sql ` OR `)})`);
    }
    return whereQueries;
}
export async function fetchRecords(table, filters, selectedColumns, sortBy, additionalCondition, paginationData) {
    let query = selectedColumns
        ? db.select(selectedColumns).from(table).$dynamic()
        : db.select().from(table).$dynamic();
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
        return results;
    }
    return results;
}
export function parseOrderByQuery(orderBy, defaultColumn = "created_at", defaultDirection = "desc") {
    let orderByQueryData = {
        columns: [defaultColumn],
        values: [defaultDirection],
    };
    if (!orderBy) {
        return orderByQueryData;
    }
    const orderByColumns = [];
    const orderByValues = [];
    const queryStrings = orderBy.split(",");
    queryStrings.forEach((queryString) => {
        const [column, value] = queryString.split(":");
        orderByColumns.push(column);
        orderByValues.push(value);
    });
    orderByQueryData = {
        columns: orderByColumns,
        values: orderByValues,
    };
    return orderByQueryData;
}
export function buildInConditions(table, inQueryData) {
    if (!inQueryData || (Object.keys(inQueryData).length === 0 && inQueryData.values.length === 0)) {
        return null;
    }
    const columnInfo = sql.raw(`${getTableName(table)}.${inQueryData.key}`);
    const inQuery = inArray(columnInfo, inQueryData.values);
    return inQuery;
}
