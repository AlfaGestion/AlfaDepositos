import { openDatabaseAsync } from "expo-sqlite";

const wrapDatabase = (name, options, directory) => ({
  transaction: (fn, error, success) => {
    (async () => {
      const db = await openDatabaseAsync(name, options, directory);
      await db.withTransactionAsync(async () => {
        const tx = {
          executeSql: async (sql, params = [], onSuccess, onError) => {
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
          },
        };
        await fn(tx);
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
