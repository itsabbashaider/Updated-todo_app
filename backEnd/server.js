require("dotenv").config({ path: "./.env" });

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");

const router       = require("./routes/index");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// credentials:true allows browser to send httpOnly cookie cross-origin
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());  // parses req.cookies

app.use("/api", router);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));