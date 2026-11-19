require("dotenv").config();
const mysql = require("mysql");

// Perf P0: the old code used a single shared mysql.createConnection().
// Every request in the whole app serialised through one connection: one
// slow query blocked everything, and a dropped connection (no reconnect,
// no pool, no timeouts) killed the API until restart.
//
// A pool hands each query its own connection and returns it afterwards,
// so requests run concurrently and a dead connection is replaced.
//
// The exported object keeps the same shape the routes expect: every
// caller does util.promisify(connection.query).bind(connection), and
// pool.query has the same (sql, values, callback) signature, so no
// caller had to change for this swap.
const pool = mysql.createPool({
  connectionLimit: 10,
  queueLimit: 0,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "iaproject",
  port: process.env.DB_PORT || "3306",
});

// Idle-connection errors (e.g. the server closing a stale connection)
// are emitted here instead of crashing the process; the pool replaces
// the dead connection on the next query.
pool.on("error", (err) => {
  console.error("MySQL pool error:", err);
});

module.exports = pool;
