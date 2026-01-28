import { openDatabaseAsync } from "expo-sqlite";

const wrapDatabase = (name, options, directory) => ({
  transaction: (fn, error, success) => {
    (async () => {
      const db = await openDatabaseAsync(name, options, directory);
      await db.withTransactionAsync(async () => {
        const pending = [];
        const tx = {
<<<<<<< HEAD
          executeSql: (sql, params = [], onSuccess, onError) => {
            const run = (async () => {
=======
          executeSql: async (sql, params = [], onSuccess, onError) => {
            const exec = (async () => {
>>>>>>> ca358da7a64424592bcf118f3a6b38b702af56d6
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
<<<<<<< HEAD
            pending.push(run);
            return run;
          },
        };
        await fn(tx);
        if (pending.length) {
          await Promise.allSettled(pending);
=======
            pending.push(exec);
            return exec;
          },
        };
        const maybePromise = fn(tx);
        if (maybePromise && typeof maybePromise.then === "function") {
          await maybePromise;
        }
        if (pending.length) {
          await Promise.all(pending);
>>>>>>> ca358da7a64424592bcf118f3a6b38b702af56d6
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
