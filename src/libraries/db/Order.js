import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class Order extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "orders";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      account: { type: types.TEXT },
      date: { type: types.TEXT },
      id_seller: { type: types.TEXT },
      net: { type: types.NUMERIC },
      iva: { type: types.NUMERIC },
      total: { type: types.NUMERIC },
      transferred: { type: types.NUMERIC },
      bill: { type: types.NUMERIC },
      delivery: { type: types.NUMERIC },
      price_class: { type: types.NUMERIC },
      latitude: { type: types.TEXT },
      longitude: { type: types.TEXT },
      condition: { type: types.TEXT },
      cpte: { type: types.TEXT },
      obs: { type: types.TEXT },
      ecpte: { type: types.TEXT },
      cae: { type: types.TEXT },
      vto_cae: { type: types.TEXT },
      tc: { type: types.TEXT }
    };
  }

  static async getLastId() {
    const sql = `SELECT MAX(id) AS id FROM orders`;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }

  static async findAll() {
    // const sql = `Select a.*, b.name from orders a left join accounts b on a.account=b.code`;
    const sql = `
      SELECT 
        a.*, 
        IFNULL(b.name, 'Depósito general') as name 
      FROM orders a 
      LEFT JOIN accounts b ON a.account = b.code
    `;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }

  static async findById(id) {
    const sql = `Select * from orders where id=${id}`;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }
}
