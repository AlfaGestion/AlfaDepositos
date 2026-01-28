import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class Configuration extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "config";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      key: { type: types.TEXT },
      value: { type: types.TEXT },
    };
  }

  static async getConfig(key) {
    const sql = `SELECT value from config where key='${key}'`;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }

  static async getConfigValue(key) {
    const sql = `SELECT value from config where key='${key}'`;
    const data = await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
    try {
      return data[0].value;
    } catch (e) {
      return "";
    }
  }

  static async setConfigValue(key, value) {
    const exists = await Configuration.getConfigValue(key);
    let sql;
    if (!exists) {
      sql = `INSERT INTO config (key,value) values('${key}','${value}')`;
    } else {
      sql = `UPDATE config set value='${value}' WHERE key='${key}'`;
    }
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }

  static async getConfigAPI() {
    const sql = `SELECT * from config where key='API_URI' or key='ALFA_ACCOUNT' or key='PASSWORD_SYNC' or key='USERNAME_SYNC' or key='ALFA_DATABASE_ID'`;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }
}
