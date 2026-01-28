import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class Seller extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "sellers";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      code: { type: types.TEXT },
      name: { type: types.TEXT },
      password: { type: types.TEXT },
    };
  }

  static async logIn(code, password) {
    const sql = `Select * from sellers where code='${code}' and password='${password}'`;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }
}
