import { getTableName, SQL, sql } from "drizzle-orm";
import { DBTable } from "../types/dbTypes.js";

export function prepareSelectColumnsForQuery< T extends DBTable, K extends keyof T["_"]["columns"]>( table: T, columns: K[]){
    const result = {} as Record<K, SQL>;
    if(!Array.isArray(columns) || columns.length < 1){
        return result
    }
    columns.forEach((column) => {
        result[column] = sql.raw(
            `${getTableName(table)}.${String(column)}`
        );
    });

    return result;
}