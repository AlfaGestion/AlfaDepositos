import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class PaymentInvoices extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "paymentsInvoices";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      paymentId: { type: types.TEXT },
      tc: { type: types.TEXT },
      idcomprobante: { type: types.TEXT },
      amount: { type: types.FLOAT },
      date: { type: types.TEXT }
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
