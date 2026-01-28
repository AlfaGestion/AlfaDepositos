import SQLite from "@db/SQLiteCompat";
const db = SQLite.openDatabase("alfadeposito.db");

const getTasks = async () => {
  const data = await getDataFromDb("asd");
  return data;
};

const getDataFromDb = async (sql) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("select * from cobranzas", [], (_, { rows: { _array } }) => {
          console.log(_array);
        });
      },
      (t, error) => {
        console.log(error);
        reject(error);
      },
      (_t, _success) => {
        resolve(_success);
      }
    );
  });
};

export { getTasks };
