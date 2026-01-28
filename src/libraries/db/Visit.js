import SQLite from "@db/SQLiteCompat";
import { BaseModel, types } from "expo-sqlite-orm";

export default class Visit extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase("alfadeposito.db");
  }

  static get tableName() {
    return "visits";
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true },
      account: { type: types.TEXT },
      obs: { type: types.TEXT },
      name: { type: types.TEXT },
      monday: { type: types.INTEGER },
      tuesday: { type: types.INTEGER },
      wednesday: { type: types.INTEGER },
      thursday: { type: types.INTEGER },
      friday: { type: types.INTEGER },
      saturday: { type: types.INTEGER },
      sunday: { type: types.INTEGER },
      order_visit: { type: types.INTEGER },
    };
  }

  static async findByDay(query = "") {
    const currentDate = new Date();
    let whereDay = "";

    switch (currentDate.getDay()) {
      case 1:
        whereDay = " a.monday = 1 ";
        break;
      case 2:
        whereDay = " a.tuesday = 1 ";
        break;
      case 3:
        whereDay = " a.wednesday = 1 ";
        break;
      case 4:
        whereDay = " a.thursday = 1 ";
        break;
      case 5:
        whereDay = " a.friday = 1 ";
        break;
      case 6:
        whereDay = " a.saturday = 1 ";
        break;
      case 7:
        whereDay = " a.sunday = 1 ";
        break;
      default:
        break;
    }

    if (query) {
      whereDay += ` and b.name LIKE '%${query}%' `
    }

    const sql = `
    SELECT a.*, b.address,b.location,b.phone,c.visited,c.obs as obs_details,c.id as idVisited,
    (SELECT count(*) from orders where account=a.account) as qty_orders
    FROM visits a 
    LEFT JOIN accounts b ON a.account = b.code
    LEFT JOIN visits_detail c ON a.account = c.account
    WHERE ${whereDay} 
    ORDER BY a.order_visit ASC`;
    // and c.id is null
    return await this.repository.databaseLayer.executeSql(sql, []).then(({ rows }) => rows);
  }
}
