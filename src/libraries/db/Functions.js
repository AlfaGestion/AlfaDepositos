import SQLite from "@db/SQLiteCompat";
import DatabaseLayer from "expo-sqlite-orm/src/DatabaseLayer";

import Configuration from "@db/Configuration";

function bulkInsert(table, items) {
  const databaseLayer = new DatabaseLayer(async () => SQLite.openDatabase("alfadeposito.db"), table);
  return databaseLayer.bulkInsertOrReplace(items);
}

async function existsDB() {
  const data = await Configuration.getConfigAPI();

  const API_URI = data.find((item) => item.key == "API_URI");
  const ALFA_ACCOUNT = data.find((item) => item.key == "ALFA_ACCOUNT");
  const PASSWORD_SYNC = data.find((item) => item.key == "PASSWORD_SYNC");
  const USERNAME_SYNC = data.find((item) => item.key == "USERNAME_SYNC");
  const ALFA_DATABASE_ID = data.find((item) => item.key == "ALFA_DATABASE_ID");

  if (
    API_URI === undefined ||
    ALFA_ACCOUNT === undefined ||
    PASSWORD_SYNC === undefined ||
    USERNAME_SYNC === undefined ||
    ALFA_DATABASE_ID === undefined
  ) {
    return false;
  }

  return true;
}

export { bulkInsert, existsDB };
