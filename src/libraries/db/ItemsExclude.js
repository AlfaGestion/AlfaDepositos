import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class ItemsExclude extends BaseModel {
    constructor(obj) {
        super(obj);
    }

    static get database() {
        return async () => SQLite.openDatabase("alfadeposito.db");
    }

    static get tableName() {
        return "items_exclude";
    }

    static get columnMapping() {
        return {
            id: { type: types.INTEGER, primary_key: true },
            code: { type: types.TEXT },
        };
    }
}
