const express = require("express");
const app = express();

// ENV
require("dotenv").config();

// static folder
app.use(express.static("images"));

// parser urlencoded & json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Cookie Parser
app.use(require("cookie-parser")());

// cors
app.use(
  require("cors")({
    origin: "http://localhost:3000",
  })
);

//morgan
if (process.env.NODE_ENV === "development") app.use(require("morgan")("dev"));

//Connection With Database
require("./config/connection_with_mysql");
/* ----------------------------------------------------------------------------------------- */

try {
  // routes AUTH
  app.use("/api/auth", require("./routes/auth.routes"));
  app.use("/api/users", require("./routes/users.routes"));
  // ROUTE
  app.use("/api/categories", require("./routes/categories.routes"));
  app.use("/api/products", require("./routes/products.routes"));
  app.use("/api/product_images", require("./routes/product.images.routes"));
  app.use("/api/carts", require("./routes/carts.routes"));
} catch (error) {
  const ApiErrorHandler = require("./utils/ApiErrorHandler");
  app.use((req, res, next) =>
    next(new ApiErrorHandler(error.message, 400, error))
  );
}

/* ----------------------------------------------------------------------------------------- */
// Not found
app.use("*", require("./middlewares/errorHandle.middleware").notFound);

// errorHandle
app.use(require("./middlewares/errorHandle.middleware").errorHandle);

const PORT = process.env.PORT || 4010;
const server = app.listen(PORT, (error) => {
  if (error) console.error("listen error: ", error);
  console.info(
    `server listening on port:${PORT} in {${process.env.NODE_ENV}} mode`
  );
});

// Out Side Express Error
process.on("unhandledRejection", (error) => {
  console.error("Error Out Express: ", error);
  server.close((error) => {
    console.error("Shutdown Server");
    process.exit(1);
  });
});
