import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class OrderDetail extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "orders_detail";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      order_id: { type: types.INTEGER },
      product: { type: types.TEXT },
      qty: { type: types.NUMERIC },
      bultos: { type: types.NUMERIC },
      unitary: { type: types.NUMERIC },
      total: { type: types.NUMERIC },
      transferred: { type: types.NUMERIC },
      discount_perc: { type: types.NUMERIC },
    };
  }

  static async findByIdOrder(id) {
    const sql = `Select * from orders_detail where order_id=${id}`;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }

  static async deleteItemsByOrderId(id) {
    const sql = `delete from orders_detail where order_id=${id}`;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }
}
