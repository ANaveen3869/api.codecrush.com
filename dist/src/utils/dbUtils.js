import { getTableName, sql } from "drizzle-orm";
export function prepareSelectColumnsForQuery(table, columns) {
    const result = {};
    if (!Array.isArray(columns) || columns.length < 1) {
        return result;
    }
    columns.forEach((column) => {
        result[column] = sql.raw(`${getTableName(table)}.${String(column)}`);
    });
    return result;
}
