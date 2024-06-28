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

const getTask = async (req, res, next) => {
  try {
    const category = req.query.category;

    let taskDetails = await Task.find({ queue: category });
    console.log(taskDetails);

    taskDetails = Array.from(taskDetails);

    return res.json({
      data: taskDetails,
    });
  } catch (error) {
    next(error);
  }
};

const updateQueueOnTask = async (req, res, next) => {
  try {
    const taskId = req.query.id || "";
    const updatedQueue = req.query.queue || "";

    if (!taskId) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const taskDetails = await Task.findOne({
      _id: taskId,
    });

    if (!taskDetails) {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    await Task.updateOne(
      { _id: taskId },
      {
        $set: {
          title: taskDetails?.title,
          priority: taskDetails?.priority,
          assignedTo: taskDetails?.assignedTo,
          queue: updatedQueue,
          tasks: taskDetails?.tasks,
          dueDate: taskDetails?.dueDate,
          user: taskDetails?.user,
        },
      }
    );

    res.json({ message: "Task updated successfully", updated: true });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const taskId = req.query.id || "";

    const taskDetails = await Task.findById(taskId);

    if (!taskDetails) {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    res.json({ data: taskDetails });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const taskId = req.query.id || "";

    if (!taskId) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const isTaskExists = await Task.findOne({
      _id: taskId,
    });

    if (!isTaskExists) {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    const { title, priority, assignedTo, queue, tasks, dueDate, user } =
      req.body;

    await Task.updateOne(
      { _id: taskId },
      {
        $set: {
          title,
          priority,
          assignedTo,
          queue,
          tasks,
          dueDate,
          user,
        },
      }
    );

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteTaskById = async (req, res, next) => {
  try {
    const taskId = req.query.id || "";

    const taskDetails = await Task.deleteOne({ _id: taskId });

    if (!taskDetails) {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    res.json({ message: "Task deleted successfully", isDeleted: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTask,
  getTask,
  updateQueueOnTask,
  getTaskById,
  updateTask,
  deleteTaskById,
};
