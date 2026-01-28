import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class Account extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "locations";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      date: { type: types.TEXT },
      latitude: { type: types.TEXT },
      longitude: { type: types.TEXT },
      accuracy: { type: types.TEXT },
      altitude: { type: types.TEXT },
      speed: { type: types.TEXT },
      timestamp: { type: types.TEXT },
    };
  }
}
