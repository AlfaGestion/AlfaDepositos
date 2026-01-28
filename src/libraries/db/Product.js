import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class Product extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "products";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      code: { type: types.TEXT },
      codigoBarras: { type: types.TEXT },
      name: { type: types.TEXT },
      category: { type: types.TEXT },
      family: { type: types.TEXT },
      iva: { type: types.NUMERIC },
      internal_taxes: { type: types.NUMERIC },
      cant_propuesta: { type: types.NUMERIC },
      exempt: { type: types.NUMERIC },
      price1: { type: types.NUMERIC },
      price2: { type: types.NUMERIC },
      price3: { type: types.NUMERIC },
      price4: { type: types.NUMERIC },
      price5: { type: types.NUMERIC },
      price6: { type: types.NUMERIC },
      price7: { type: types.NUMERIC },
      price8: { type: types.NUMERIC },
      price9: { type: types.NUMERIC },
      price10: { type: types.NUMERIC },
    };
  }

  static async findLikeName(name, classPrice = 1, limit = 20, lista = '') {
    const page = 1;
    // console.log(lista)
    let sql;
    if (lista == '' || lista == null || lista == undefined) {
      sql = `Select cant_propuesta,code, codigoBarras, name, id, price${classPrice} from products 
    where (lower(name) like '%${name.toLowerCase()}%' or lower(code) like '%${name.toLowerCase()}%') 
    order by name ASC limit ${limit} offset ${(page - 1) * limit}`;
    } else {
      sql = `Select cant_propuesta,code, codigoBarras, name, id, price${classPrice} from products_listas 
    where lista='${lista}' and (lower(name) like '%${name.toLowerCase()}%' or lower(code) like '%${name.toLowerCase()}%') 
    order by name ASC limit ${limit} offset ${(page - 1) * limit}`;
    }
    // console.log(sql)
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }

  static async findByCode(code, lista = '') {
    let sql;
    const searchCode = code.toLowerCase();

    if (lista == '' || lista == null || lista == undefined) {
      sql = `SELECT cant_propuesta, code, codigoBarras, name, id, price1, price2, price3, price4, price5, price6, price7, price8, price9, price10 
             FROM products 
             WHERE (lower(code) = '${searchCode}' OR lower(codigoBarras) = '${searchCode}') 
             ORDER BY name ASC LIMIT 1`;
    } else {
      sql = `SELECT cant_propuesta, code, codigoBarras, name, id, price1, price2, price3, price4, price5, price6, price7, price8, price9, price10 
             FROM products_listas 
             WHERE lista='${lista}' AND (lower(code) = '${searchCode}' OR lower(codigoBarras) = '${searchCode}') 
             ORDER BY name ASC LIMIT 1`;
    }

    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }
}
