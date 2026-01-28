import SQLite from "@db/SQLiteCompat";
import { Platform } from "react-native";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => { },
        };
      },
    };
  }

  const db = SQLite.openDatabase("alfadeposito.db");
  createDatabase(db);
  return db;
}

function createDatabase(db) {
  db.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS configuration (_id INTEGER PRIMARY KEY AUTOINCREMENT , key TEXT, value TEXT);"
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS rubros (_id INTEGER PRIMARY KEY AUTOINCREMENT , idrubro TEXT, descripcion TEXT);"
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS vendedores (_id INTEGER PRIMARY KEY, idvendedor TEXT, nombre TEXT, codigodevalidacion TEXT);"
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS familias (_id INTEGER PRIMARY KEY, idfamilia TEXT, descripcion TEXT);"
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS articulos (_id INTEGER ,codigoBarras TEXT, idarticulo TEXT, descripcion TEXT, idrubro TEXT, idfamilia TEXT, iva NUMERIC, impuestos_internos NUMERIC, exento NUMERIC, precio1 NUMERIC, precio2 NUMERIC, precio3 NUMERIC, precio4 NUMERIC, precio5 NUMERIC, precio6 NUMERIC, precio7 NUMERIC, precio8 NUMERIC, precio9 NUMERIC, precio10 NUMERIC);"
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS proveedores (_id INTEGER,codigo TEXT,codigo_opcional TEXT,razon_social TEXT,domicilio TEXT,localidad TEXT,cuit TEXT,iva NUMERIC,clase_precio NUMERIC,porcdto NUMERIC,cpte_default TEXT,idvendedor TEXT, telefono TEXT, email TEXT);"
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS visitas (_id INTEGER, cliente TEXT NOT NULL,observaciones TEXT,nombre TEXT,lunes INTEGER,martes INTEGER,miercoles INTEGER,jueves INTEGER,viernes INTEGER,sabado INTEGER,domingo INTEGER);"
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS pedidos (_id INTEGER PRIMARY KEY AUTOINCREMENT, cuenta TEXT, fecha TEXT, idvendedor TEXT, neto NUMERIC, total NUMERIC, transferido NUMERIC, gpsX NUMERIC,gpsY NUMERIC, facturar NUMERIC, reparto NUMERIC, clase NUMERIC);"
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS pedidosItems (_id INTEGER PRIMARY KEY AUTOINCREMENT, idpedido INTEGER, idarticulo TEXT, cantidad REAL, importe_unitario REAL, porcdto REAL, total REAL, transferido INTEGER);"
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS cobranzas (id INTEGER PRIMARY KEY, fecha TEXT, cuenta TEXT, importe REAL, mp TEXT, observacion TEXT, idvendedor TEXT, tc TEXT);"
    );

    // tx.executeSql(
    //   "CREATE TABLE IF NOT EXISTS visitas (cliente TEXT NOT NULL,observaciones TEXT,nombre TEXT,lunes INTEGER,martes INTEGER,miercoles INTEGER,jueves INTEGER,viernes INTEGER,sabado INTEGER,domingo INTEGER);"
    // );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS mediosPago (_id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT, descripcion TEXT) "
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS tareas (_id INTEGER PRIMARY KEY, cliente TEXT, fecha TEXT, firma BLOB, obs TEXT, servicio TEXT, documento TEXT, telefono TEXT, imagen1a BLOB, imagen1b BLOB, imagen2a BLOB, imagen2b BLOB, imagen3a BLOB, imagen3b BLOB, imagen4a BLOB, imagen4b BLOB, imagen5a BLOB, imagen5b BLOB)"
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS servicios (_id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT, descripcion TEXT)"
    );
  });
}

function deleteItem(tbl, field, value, stringValue = true) {
  let sep = stringValue ? "'" : "";
  let query = `delete from ${tbl} where ${field}=${sep}${value}${sep}; `;
  const db = openDatabase();

  db.transaction((trx) => {
    trx.executeSql(
      query,
      [],
      (transact, resultset) => {
        return "ok";
      },
      (transact, err) => {
        return err;
      }
    );
  });
}

function insertInDB(tbl, fields, values, deleteTable, returnID = false) {
  return new Promise(function (resolve, reject) {
    const db = openDatabase();

    if (deleteTable) {
      let query = `delete from ${tbl}; `;
      db.transaction((trx) => {
        trx.executeSql(
          query,
          [],
          (transact, resultset) => {
            insertar(tbl, fields, values, returnID)
              .then((r) => {
                resolve(r);
              })
              .catch((e) => {
                reject("Error en la promesa: " + e);
              });
          },
          (transact, err) => {
            reject("Error al eliminar " + err);
          }
        );
      });
    } else {
      insertar(tbl, fields, values, returnID)
        .then((r) => {
          resolve(r);
        })
        .catch((e) => {
          reject("Error en la promesa: " + e);
        });
    }
  });
}

function insertar(tbl, fields, values, returnID = false) {
  return new Promise(function (resolve, reject) {
    const db = openDatabase();

    const query = `INSERT INTO ${tbl} VALUES ${fields};`;

    db.transaction((trx) => {
      trx.executeSql(
        query,
        values,
        (transact, resultset) => {
          resolve(resultset.insertId);
        },
        (transact, err) => {
          reject(`Error al insertar datos en la tabla ${tbl} : ${err}`);
        }
      );
    });
  });
}

function doselect() {
  const db = openDatabase();

  db.transaction((tx) => {
    tx.executeSql("SELECT * FROM proveedores limit 0,10", [], (trans, result) => {
      // console.log(result);
    });
  });
}

const ExecuteQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    const db = openDatabase();

    db.transaction((trans) => {
      trans.executeSql(
        sql,
        params,
        (trans, results) => {
          resolve(results);
        },
        (error) => {
          reject(error);
        }
      );
    });
  });

async function getFromDB(tbl, limit = 20, wh = "", sqlP = "", fields = "") {
  if (wh != "") {
    wh = " WHERE " + wh;
  }

  fields = fields == "" ? "*" : fields;

  let sql = `SELECT ${fields} FROM ${tbl} ${wh} LIMIT 0,${limit}`;

  if (sqlP != "") {
    sql = sqlP;
  }

  let selectQuery = await ExecuteQuery(sql, []);
  var rows = selectQuery.rows._array;
  return rows;
}

export { openDatabase, insertInDB, doselect, getFromDB, ExecuteQuery, deleteItem };
