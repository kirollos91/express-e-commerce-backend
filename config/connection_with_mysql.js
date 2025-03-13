const mysql = require("mysql2");

const DB = mysql.createConnection({
  host: process.env.HOST,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
});

DB.connect((error) => {
  if (error) console.error("DATABASE Error:", error);
  console.info("connected with mysql database successfully");
});

module.exports = DB;
