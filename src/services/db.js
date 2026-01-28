import Category from "@db/Category";
import Accounts from "@db/Account";
import Family from "@db/Family";
import Order from "@db/Order";
import OrderDetail from "@db/OrderDetail";
import Payment from "@db/Payment";
import PaymentMethod from "@db/PaymentMethod";
import Product from "@db/Product";
import Location from "@db/Location";
import Service from "@db/Service";
import Task from "@db/Task";
import Visit from "@db/Visit";
import VisitDetails from "@db/VisitDetails";
import PaymentInvoices from "@db/PaymentInvoices";
import PaymentMethods from "@db/PaymentMethods";
import ProductLista from "../libraries/db/ProductLista";
import ItemsExclude from "../libraries/db/ItemsExclude";
import Stock from "../libraries/db/Stock";

export const restartTables = async () => {
  const drop = async (label, fn) => {
    try {
      await fn();
    } catch (e) {
      throw new Error(`Error al borrar ${label}: ${e?.message || e}`);
    }
  };

  const create = async (label, fn) => {
    try {
      await fn();
    } catch (e) {
      throw new Error(`Error al crear ${label}: ${e?.message || e}`);
    }
  };

  await drop("Payment", () => Payment.dropTable());
  await drop("Location", () => Location.dropTable());
  await drop("Category", () => Category.dropTable());
  await drop("Accounts", () => Accounts.dropTable());
  await drop("Family", () => Family.dropTable());
  await drop("Order", () => Order.dropTable());
  await drop("OrderDetail", () => OrderDetail.dropTable());
  await drop("PaymentInvoices", () => PaymentInvoices.dropTable());
  await drop("PaymentMethods", () => PaymentMethods.dropTable());
  await drop("PaymentMethod", () => PaymentMethod.dropTable());
  await drop("Product", () => Product.dropTable());
  await drop("ProductLista", () => ProductLista.dropTable());
  await drop("Service", () => Service.dropTable());
  await drop("Task", () => Task.dropTable());
  await drop("Visit", () => Visit.dropTable());
  await drop("VisitDetails", () => VisitDetails.dropTable());
  await drop("ItemsExclude", () => ItemsExclude.dropTable());
  await drop("Stock", () => Stock.dropTable());

  await create("Location", () => Location.createTable());
  await create("Category", () => Category.createTable());
  await create("Accounts", () => Accounts.createTable());
  await create("Family", () => Family.createTable());
  await create("Order", () => Order.createTable());
  await create("OrderDetail", () => OrderDetail.createTable());
  await create("Payment", () => Payment.createTable());
  await create("PaymentMethod", () => PaymentMethod.createTable());
  await create("Product", () => Product.createTable());
  await create("Service", () => Service.createTable());
  await create("Task", () => Task.createTable());
  await create("Visit", () => Visit.createTable());
  await create("VisitDetails", () => VisitDetails.createTable());
  await create("PaymentInvoices", () => PaymentInvoices.createTable());
  await create("PaymentMethods", () => PaymentMethods.createTable());
  await create("ItemsExclude", () => ItemsExclude.createTable());
  await create("Stock", () => Stock.createTable());
};
