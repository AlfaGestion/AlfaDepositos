import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class Task extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "tasks";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      account: { type: types.TEXT },
      date: { type: types.TEXT },
      obs: { type: types.TEXT },
      service: { type: types.TEXT },
      seller: { type: types.TEXT },
      sign: { type: types.TEXT },
      document: { type: types.TEXT },
      phone: { type: types.TEXT },
      accountName: { type: types.TEXT },
      image1a: { type: types.TEXT },
      image1b: { type: types.TEXT },
      image2a: { type: types.TEXT },
      image2b: { type: types.TEXT },
      image3a: { type: types.TEXT },
      image3b: { type: types.TEXT },
      image4a: { type: types.TEXT },
      image4b: { type: types.TEXT },
      image5a: { type: types.TEXT },
      image5b: { type: types.TEXT },
    };
  }

  static async findAll() {
    const sql = `Select a.*, b.name,c.name as service_name from tasks a left join accounts b 
      on a.account=b.code left join services c on c.code=a.service`;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }

  static async findById(id) {
    const sql = `Select * from tasks where id=${id}`;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }
}
