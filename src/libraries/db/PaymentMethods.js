import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class PaymentMethods extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "paymentsMethods";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      paymentId: { type: types.TEXT },
      account: { type: types.TEXT },
      obs: { type: types.TEXT },
      checkNumber: { type: types.TEXT },
      amount: { type: types.FLOAT },
    };
  }

  //   static async findAll() {
  //     const sql = "Select a.*, b.name from payments a left join accounts b on a.account=b.code";
  //     return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  //   }

  //   static async findAll() {
  //     options = {
  //       columns: "id,fecha,cuenta,importe,mp,observacion,idvendedor,tc",
  //       limit: 100,
  //       order: "fecha asc",
  //     };

  //     return (data = await this.query(options));
  //   }
}
