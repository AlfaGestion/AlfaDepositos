import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class Stock extends BaseModel {
    constructor(obj) {
        super(obj);
    }

    static get database() {
        return async () => SQLite.openDatabase("alfadeposito.db");
    }

    static get tableName() {
        return "stock";
    }

    static get columnMapping() {
        return {
            id: { type: types.INTEGER, primary_key: true },
            tc: { type: types.TEXT },
            cpte: { type: types.TEXT },
            id_articulo: { type: types.TEXT },
            descripcion: { type: types.TEXT },
            id_complemento: { type: types.TEXT },
            secuencia: { type: types.NUMERIC },
            cantidad_uds: { type: types.NUMERIC },
            cantidad_bultos: { type: types.NUMERIC },
            cuenta_proveedor: { type: types.TEXT },
            revisado: { type: types.TEXT },
            anulado: { type: types.TEXT },
        };
    }

    static async getLastId() {
        const sql = `SELECT MAX(id) AS id FROM stock`;
        return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
    }

    static async findAll() {
        const sql = `Select a.*, b.name from stock a left join accounts b on a.account=b.code`;
        return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
    }

    static async findById(id) {
        const sql = `Select * from stock where id=${id}`;
        return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
    }
}
