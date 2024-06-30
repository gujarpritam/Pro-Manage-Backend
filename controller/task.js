const Task = require("../models/task");
const Assignee = require("../models/assignee");

const addTask = async (req, res) => {
  try {
    const {
      title,
      priority,
      assignedTo,
      queue,
      tasks,
      checkedTasks,
      checkedNumber,
      dueDate,
      user,
    } = req.body;

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
      checkedTasks,
      checkedNumber,
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
          checkedTasks: taskDetails?.checkedTasks,
          checkedNumber: taskDetails?.checkedNumber,
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

    const {
      title,
      priority,
      assignedTo,
      queue,
      tasks,
      dueDate,
      checkedTasks,
      checkedNumber,
      user,
    } = req.body;

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
          checkedTasks,
          checkedNumber,
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

const getAnalyticsDetails = async (req, res, next) => {
  try {
    let todoTasks = await Task.find({ queue: "todo" });
    let backlogTasks = await Task.find({ queue: "backlog" });
    let progressTasks = await Task.find({ queue: "progress" });
    let completedTasks = await Task.find({ queue: "done" });
    let lowPriority = await Task.find({ priority: "low" });
    let moderatePriority = await Task.find({ priority: "moderate" });
    let highPriority = await Task.find({ priority: "high" });
    let allTasks = await Task.find({});
    let nullDueDateTasks = await Task.find({ dueDate: null });

    let dueDateTasks = allTasks?.length - nullDueDateTasks?.length;

    return res.json({
      data: {
        todoTasks: todoTasks?.length,
        backlogTasks: backlogTasks?.length,
        progressTasks: progressTasks?.length,
        completedTasks: completedTasks?.length,
        lowPriority: lowPriority?.length,
        moderatePriority: moderatePriority?.length,
        highPriority: highPriority?.length,
        dueDateTasks: dueDateTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addUser = async (req, res, next) => {
  try {
    const email = req.query.email;

    console.log(email);

    if (!email) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const isUserExists = await Assignee.findOne({
      email: email,
    });

    if (isUserExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const userDetails = new Assignee({
      email,
    });

    await userDetails.save();

    res.json({ message: "User created successfully", isUserCreated: true });
  } catch (error) {
    next(error);
  }
};

const getAllAssignee = async (req, res, next) => {
  try {
    // const category = req.query.category;

    let assigneeDetails = await Assignee.find({});
    console.log("assignee", assigneeDetails);

    assigneeDetails = Array.from(assigneeDetails);

    return res.json({
      data: assigneeDetails,
    });
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
  getAnalyticsDetails,
  addUser,
  getAllAssignee,
};
