import { openDatabaseAsync } from "expo-sqlite";

let transactionQueue = Promise.resolve();
let cachedDb = null;
let cachedDbPromise = null;

const getDb = async (name, options, directory) => {
  if (cachedDb) return cachedDb;
  if (!cachedDbPromise) {
    cachedDbPromise = openDatabaseAsync(name, options, directory).then((db) => {
      cachedDb = db;
      return db;
    });
  }
  return cachedDbPromise;
};

const runWithQueue = (work, onError) => {
  transactionQueue = transactionQueue
    .then(() => work())
    .catch((e) => {
      if (onError) {
        onError(e);
      } else {
        // Avoid breaking the queue on unhandled errors
        // eslint-disable-next-line no-console
        console.error("[DB] transaction error", e);
      }
    });
  return transactionQueue;
};

const wrapDatabase = (name, options, directory) => ({
  transaction: (fn, error, success) => {
    runWithQueue(async () => {
      const db = await getDb(name, options, directory);
      // Skip PRAGMA busy_timeout to avoid execAsync issues on some devices
      await db.withTransactionAsync(async () => {
        const pending = [];
        const runStatement = async (database, sql, params) => {
          const stmt = await database.prepareAsync(sql);
          const result = await stmt.executeAsync(...params);
          let rows = [];
          try {
            rows = await result.getAllAsync();
          } catch (e) {
            rows = [];
          }
          const resultSet = {
            rows: { _array: rows, length: rows.length },
            insertId: result.lastInsertRowId,
            rowsAffected: result.changes,
          };
          await stmt.finalizeAsync();
          return resultSet;
        };
        const tx = {
          executeSql: (sql, params = [], onSuccess, onError) => {
            const run = (async () => {
              try {
                let resultSet = await runStatement(db, sql, params);
                if (onSuccess) {
                  onSuccess(tx, resultSet);
                }
                return resultSet;
              } catch (e) {
                const message = e?.message || "";
                if (message.includes("NullPointerException") || message.includes("execAsync")) {
                  try {
                    // Reset cached connection and retry once with a fresh handle
                    cachedDb = null;
                    cachedDbPromise = null;
                    const retryDb = await getDb(name, options, directory);
                    const resultSet = await runStatement(retryDb, sql, params);
                    if (onSuccess) {
                      onSuccess(tx, resultSet);
                    }
                    return resultSet;
                  } catch (retryError) {
                    if (onError) {
                      return onError(tx, retryError);
                    }
                    throw retryError;
                  }
                }
                if (onError) {
                  return onError(tx, e);
                }
                throw e;
              }
            })();
            pending.push(run);
            return run;
          },
        };
        const maybePromise = fn(tx);
        if (maybePromise && typeof maybePromise.then === "function") {
          await maybePromise;
        }
        if (pending.length) {
          await Promise.all(pending);
        }
      });
      if (success) {
        success();
      }
    }, error);
  },
});

const SQLite = {
  openDatabase: (name, options, directory) => wrapDatabase(name, options, directory),
};

export default SQLite;
