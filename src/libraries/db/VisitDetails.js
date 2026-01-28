import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";
// import { formatDate } from "@libraries/utils";

export default class VisitDetails extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "visits_detail";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      account: { type: types.TEXT },
      obs: { type: types.TEXT },
      seller: { type: types.TEXT },
      date: { type: types.TEXT },
      visited: { type: types.INTEGER },
    };
  }

  static async deleteVisits(date) {
    // const datenow = formatDate(new Date(), true, false)

    const sql = `
    
    DELETE FROM visits_detail 
    WHERE date != '${date}'`;
    // and c.id is null
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }
}
