import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class ProductLista extends BaseModel {
    constructor(obj) {
        super(obj);
    }

    static get database() {
        return async () => SQLite.openDatabase("alfadeposito.db");
    }

    static get tableName() {
        return "products_listas";
    }

    static get columnMapping() {
        return {
            id: { type: types.INTEGER, primary_key: true },
            code: { type: types.TEXT },
            codigoBarras: { type: types.TEXT },
            name: { type: types.TEXT },
            lista: { type: types.TEXT },
            price1: { type: types.NUMERIC },
            price2: { type: types.NUMERIC },
            price3: { type: types.NUMERIC },
            price4: { type: types.NUMERIC },
            price5: { type: types.NUMERIC },
            price6: { type: types.NUMERIC },
            price7: { type: types.NUMERIC },
            price8: { type: types.NUMERIC },
            price9: { type: types.NUMERIC },
            price10: { type: types.NUMERIC },
            cant_propuesta: { type: types.NUMERIC },
        };
    }

    static async findLikeName(name, classPrice = 1, limit = 20) {
        const page = 1;
        const sql = `Select code, codigoBarras, name, id, price${classPrice} as price1 from products 
    where (name like '%${name.toLowerCase()}%' or code like '%${name.toLowerCase()}%') 
    order by name ASC limit ${limit} offset ${(page - 1) * limit}`;
        return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
    }
}
