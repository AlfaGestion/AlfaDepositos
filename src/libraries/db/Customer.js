import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

import Configuration from "@db/Configuration";

export default class Account extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "accounts";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      code: { type: types.TEXT },
      optional_code: { type: types.TEXT },
      name: { type: types.TEXT },
      address: { type: types.TEXT },
      location: { type: types.TEXT },
      cuit: { type: types.TEXT },
      iva: { type: types.NUMERIC },
      price_class: { type: types.NUMERIC },
      discount_perc: { type: types.NUMERIC },
      tc_default: { type: types.TEXT },
      id_seller: { type: types.TEXT },
      phone: { type: types.TEXT },
      mail: { type: types.TEXT },
      lista: { type: types.TEXT },
    };
  }

  static async getAll(seller, name = null, limit = 20, page = 1) {
    const onlyAccountOfSeller = await Configuration.getConfigValue("SOLO_CLIENTES_VENDEDOR");

    let where;

    if (onlyAccountOfSeller == 1) {
      if (name != "") {
        where = ` where id_seller='${seller}' and (name like '%${name.toLowerCase()}%' or code like '%${name.toLowerCase()}%')`;
      } else {
        where = ` where id_seller='${seller}'`;
      }
    } else {
      if (name) {
        where = ` where (name like '%${name.toLowerCase()}%' or code like '%${name.toLowerCase()}%')`;
      } else {
        where = "";
      }
    }

    const sql =
      "Select code,name,price_class,lista,id from accounts " +
      where +
      " order by name ASC limit " +
      limit +
      " offset " +
      (page - 1) * limit;
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }

  static async findLikeName(name, seller = null) {
    let where;

    if (seller) {
      where = { id_seller_eq: seller, name_cont: `%${name.toLowerCase()}%` };
    } else {
      where = { name_cont: `%${name.toLowerCase()}%` };
    }
    const options = {
      columns: "code, name, id",
      where: where,
      limit: 20,
      page: 1,
      order: "name ASC",
    };

    return (data = await this.query(options));
  }

  static async getEmail(accountId) {
    const sql = `SELECT mail from accounts where code='${accountId}'`;
    const data = await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
    try {
      return data[0].mail;
    } catch (e) {
      return "";
    }
  }

  static async getCuitAndPhone(accountId) {
    const sql = `SELECT phone, cuit from accounts where code='${accountId}'`;

    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }

  static async getDataAccount(accountId) {
    const sql = `SELECT phone, cuit,name from accounts where code='${accountId}'`;

    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }
}
