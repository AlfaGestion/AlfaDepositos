import { openDatabaseAsync } from "expo-sqlite";

const wrapDatabase = (name, options, directory) => ({
  transaction: (fn, error, success) => {
    (async () => {
      const db = await openDatabaseAsync(name, options, directory);
      await db.withTransactionAsync(async () => {
        const pending = [];
        const tx = {
          executeSql: (sql, params = [], onSuccess, onError) => {
            const run = (async () => {
              try {
                const stmt = await db.prepareAsync(sql);
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
                if (onSuccess) {
                  onSuccess(tx, resultSet);
                }
                return resultSet;
              } catch (e) {
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
    })().catch((e) => {
      if (error) {
        error(e);
        return;
      }
      throw e;
    });
  },
});

const SQLite = {
  openDatabase: (name, options, directory) => wrapDatabase(name, options, directory),
};

export default SQLite;
