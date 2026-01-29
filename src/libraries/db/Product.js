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
    const search = String(name ?? "").toLowerCase();
    const searchLike = `%${search}%`;
    let sql;
    if (lista == '' || lista == null || lista == undefined) {
      sql = `Select cant_propuesta,code, codigoBarras, name, id, price${classPrice} from products 
    where (lower(name) like ? or lower(code) like ? or lower(codigoBarras) like ?) 
    order by name ASC limit ${limit} offset ${(page - 1) * limit}`;
    } else {
      sql = `Select cant_propuesta,code, codigoBarras, name, id, price${classPrice} from products_listas 
    where lista='${lista}' and (lower(name) like ? or lower(code) like ? or lower(codigoBarras) like ?) 
    order by name ASC limit ${limit} offset ${(page - 1) * limit}`;
    }
    // console.log(sql)
    return await this.repository.databaseLayer.executeSql(sql, [searchLike, searchLike, searchLike]).then(({ rows }) => rows);
  }

  static async findByCode(code, lista = '') {
    const rawCode = String(code ?? "").trim();
    const searchCode = rawCode;
    const normalizedCode = rawCode.replace(/[^0-9a-z]/gi, "");
    if (!searchCode) return [];

    const select = `SELECT cant_propuesta, code, codigoBarras, name, id, price1, price2, price3, price4, price5, price6, price7, price8, price9, price10`;

    if (lista != '' && lista != null && lista != undefined) {
      const sqlListas = `
        ${select}
        FROM products_listas
        WHERE lista=? AND (code = ? OR codigoBarras = ?)
        ORDER BY name ASC LIMIT 1`;

      let rowsListas = await this.repository.databaseLayer.executeSql(sqlListas, [lista, searchCode, searchCode]).then(({ rows }) => rows);
      if (rowsListas && rowsListas.length > 0) {
        return rowsListas;
      }

      if (normalizedCode && normalizedCode !== searchCode) {
        const sqlListasNorm = `
          ${select}
          FROM products_listas
          WHERE lista=? AND (replace(replace(codigoBarras,'-',''),' ','') = ?)
          ORDER BY name ASC LIMIT 1`;
        rowsListas = await this.repository.databaseLayer.executeSql(sqlListasNorm, [lista, normalizedCode]).then(({ rows }) => rows);
        if (rowsListas && rowsListas.length > 0) {
          return rowsListas;
        }
      }
    }

    const sql = `
      ${select}
      FROM products
      WHERE (code = ? OR codigoBarras = ?)
      ORDER BY name ASC LIMIT 1`;

    let rows = await this.repository.databaseLayer.executeSql(sql, [searchCode, searchCode]).then(({ rows }) => rows);
    if (rows && rows.length > 0) {
      return rows;
    }

    if (normalizedCode && normalizedCode !== searchCode) {
      const sqlNorm = `
        ${select}
        FROM products
        WHERE (replace(replace(codigoBarras,'-',''),' ','') = ?)
        ORDER BY name ASC LIMIT 1`;
      rows = await this.repository.databaseLayer.executeSql(sqlNorm, [normalizedCode]).then(({ rows }) => rows);
      if (rows && rows.length > 0) {
        return rows;
      }
    }

    return [];
  }

  static async ensureIndexes() {
    const sqls = [
      "CREATE INDEX IF NOT EXISTS idx_products_code ON products(code)",
      "CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(codigoBarras)",
      "CREATE INDEX IF NOT EXISTS idx_products_listas_lista_code ON products_listas(lista, code)",
      "CREATE INDEX IF NOT EXISTS idx_products_listas_lista_barcode ON products_listas(lista, codigoBarras)",
    ];

    for (const sql of sqls) {
      try {
        await this.repository.databaseLayer.executeSql(sql, []);
      } catch (e) {
        // ignore index errors to avoid blocking UI
      }
    }
  }

  static async findByCodes(codes = [], lista = '') {
    const rawCodes = Array.from(new Set((codes || []).map(c => String(c ?? "").trim()).filter(Boolean)));
    if (rawCodes.length === 0) return [];

    const normalizedCodes = Array.from(new Set(rawCodes.map(c => c.replace(/[^0-9a-z]/gi, ""))));

    const select = `SELECT cant_propuesta, code, codigoBarras, name, id, price1, price2, price3, price4, price5, price6, price7, price8, price9, price10`;
    const inRaw = rawCodes.map(() => "?").join(",");

    const exactWhere = `(trim(code) IN (${inRaw}) OR trim(codigoBarras) IN (${inRaw}))`;

    if (lista != '' && lista != null && lista != undefined) {
      const sqlListas = `
        ${select}
        FROM products_listas
        WHERE lista=? AND ${exactWhere}
      `;
      const paramsListas = [String(lista), ...rawCodes, ...rawCodes];
      let rows = await this.repository.databaseLayer.executeSql(sqlListas, paramsListas).then(({ rows }) => rows);

      // Si hay códigos con normalización distinta, buscamos solo esos faltantes
      const normalize = (c) => String(c ?? "").replace(/[^0-9a-z]/gi, "");
      const foundSet = new Set((rows || []).flatMap(r => [normalize(r.code), normalize(r.codigoBarras)]));
      const normMissing = normalizedCodes.filter(n => n && !foundSet.has(n) && !rawCodes.includes(n));

      if (normMissing.length > 0) {
        const inNorm = normMissing.map(() => "?").join(",");
        const sqlListasNorm = `
          ${select}
          FROM products_listas
          WHERE lista=? AND replace(replace(codigoBarras,'-',''),' ','') IN (${inNorm})
        `;
        const rowsNorm = await this.repository.databaseLayer.executeSql(sqlListasNorm, [String(lista), ...normMissing]).then(({ rows }) => rows);
        rows = [...(rows || []), ...(rowsNorm || [])];
      }

      return rows || [];
    }

    const sql = `
      ${select}
      FROM products
      WHERE ${exactWhere}
    `;
    let rows = await this.repository.databaseLayer.executeSql(sql, [...rawCodes, ...rawCodes]).then(({ rows }) => rows);

    const normalize = (c) => String(c ?? "").replace(/[^0-9a-z]/gi, "");
    const foundSet = new Set((rows || []).flatMap(r => [normalize(r.code), normalize(r.codigoBarras)]));
    const normMissing = normalizedCodes.filter(n => n && !foundSet.has(n) && !rawCodes.includes(n));
    if (normMissing.length > 0) {
      const inNorm = normMissing.map(() => "?").join(",");
      const sqlNorm = `
        ${select}
        FROM products
        WHERE replace(replace(codigoBarras,'-',''),' ','') IN (${inNorm})
      `;
      const rowsNorm = await this.repository.databaseLayer.executeSql(sqlNorm, normMissing).then(({ rows }) => rows);
      rows = [...(rows || []), ...(rowsNorm || [])];
    }

    return rows || [];
  }
}
