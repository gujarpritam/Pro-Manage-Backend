const Task = require("../models/task");

const addTask = async (req, res) => {
  try {
    const { title, priority, assignedTo, queue, tasks, dueDate, user } =
      req.body;

    console.log(title, priority, assignedTo);

    if (!title || !priority || !user) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const taskDetails = new Task({
      title,
      priority,
      assignedTo,
      queue,
      tasks,
      dueDate,
      user,
    });

    await taskDetails.save();

    res.json({ message: "Task created successfully", isTaskCreated: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTask,
};
