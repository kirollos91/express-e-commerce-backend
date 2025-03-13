const mysql = require("mysql");

const DB = mysql.createConnection({
  host: process.env.HOST,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.DATABASE_PORT,
  insecureAuth: true,
});

DB.connect((error) => {
  if (error) console.error("DATABASE Error:", error);

  DB.query(usersTable, (error, result) => {
    if (error) console.error("Tables Users Error:", error);
    console.log("table users created");
  });
  DB.query(categoriesTable, (error, result) => {
    if (error) console.error("Tables Categories Error:", error);
    console.log("table categories created");
  });
  DB.query(productsTable, (error, result) => {
    if (error) console.error("Tables Products Error:", error);
    console.log("table products created");
  });
  DB.query(product_imagesTable, (error, result) => {
    if (error) console.error("Tables Product_images Error:", error);
    console.log("table product_images created");
  });
  DB.query(cartsTable, (error, result) => {
    if (error) console.error("Tables Carts Error:", error);
    console.log("table carts created");
  });

  console.info("connected with mysql database successfully");
});

const usersTable = `CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    roles VARCHAR(100) NOT NULL DEFAULT "User",
    google_id VARCHAR(255) UNIQUE,
    google_token VARCHAR(255) UNIQUE,
    remember_token VARCHAR(255) UNIQUE,
    email_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
const categoriesTable = `CREATE TABLE IF NOT EXISTS categories (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT UNIQUE,
    title VARCHAR(255),
    image VARCHAR(550) NOT NULL DEFAULT "default_image.jpg",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
const productsTable = `CREATE TABLE IF NOT EXISTS products (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT UNIQUE,
    category_id INT NOT NULL,
    title VARCHAR(255),
    description VARCHAR(255),
    rating VARCHAR(255) DEFAULT 0,
    ratings_number VARCHAR(255) DEFAULT 0,
    price VARCHAR(255),
    discount VARCHAR(255) DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    about VARCHAR(255),
    status VARCHAR(255) DEFAULT "draft",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_categories FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE ON UPDATE CASCADE
);`;
const product_imagesTable = `CREATE TABLE IF NOT EXISTS product_images (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image VARCHAR(550),
    CONSTRAINT fk_product_images_products FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;

const cartsTable = `CREATE TABLE IF NOT EXISTS carts (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    count INT NOT NULL,
    CONSTRAINT fk_carts_products FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_carts_users FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);`;

module.exports = DB;
