const express = require("express");
const router = express.Router();
const taskController = require("../controller/task");

router.post("/add", taskController.addTask);
router.get("/getTask", taskController.getTask);
router.put("/updateQueue", taskController.updateQueueOnTask);

module.exports = router;
