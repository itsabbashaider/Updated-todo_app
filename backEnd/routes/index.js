const express = require("express");
const router = express.Router();
const taskRoutes = require("./task.routes");

router.use("/tasks", taskRoutes);

module.exports = router;