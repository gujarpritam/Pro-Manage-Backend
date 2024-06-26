const express = require("express");
const router = express.Router();
const taskController = require("../controller/task");

router.post("/add", taskController.addTask);

module.exports = router;
