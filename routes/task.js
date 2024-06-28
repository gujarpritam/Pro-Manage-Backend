const express = require("express");
const router = express.Router();
const taskController = require("../controller/task");

router.post("/add", taskController.addTask);
router.get("/getTask", taskController.getTask);
router.put("/updateQueue", taskController.updateQueueOnTask);
router.get("/getOne", taskController.getTaskById);
router.put("/update", taskController.updateTask);
router.delete("/delete", taskController.deleteTaskById);

module.exports = router;
