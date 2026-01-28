import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class PaymentMethod extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "payments_methods";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      code: { type: types.TEXT },
      name: { type: types.TEXT },
    };
  }

  static async findLikeName(name) {
    const options = {
      columns: "code, name, id",
      where: {
        name_cont: `%${name.toLowerCase()}%`,
      },
      limit: 20,
      page: 1,
      order: "name ASC",
    };

    return (data = await this.query(options));
  }
}
