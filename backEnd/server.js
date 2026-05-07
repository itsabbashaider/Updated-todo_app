require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const router = require("./routes/index");

const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  });