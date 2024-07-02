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
    const timeStamp = req.query.timeStamp;
    const createdBy = req.query.user;

    // console.log(category, timeStamp);
    let taskDetails, taskDetailsWithAssignee;

    if (timeStamp === "Today") {
      taskDetails = await Task.find({
        queue: category,
        user: createdBy,
        createdAt: {
          $lt: new Date(),
          $gt: new Date(
            new Date().getTime() - new Date().getHours() * 60 * 60 * 1000
          ),
        },
      });

      taskDetailsWithAssignee = await Task.find({
        queue: category,
        assignedTo: createdBy,
        createdAt: {
          $lt: new Date(),
          $gt: new Date(
            new Date().getTime() - new Date().getHours() * 60 * 60 * 1000
          ),
        },
      });
    }

    if (timeStamp === "This Week") {
      taskDetails = await Task.find({
        queue: category,
        user: createdBy,
        createdAt: {
          $lt: new Date(),
          $gt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      });

      taskDetailsWithAssignee = await Task.find({
        queue: category,
        assignedTo: createdBy,
        createdAt: {
          $lt: new Date(),
          $gt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (timeStamp === "This Month") {
      taskDetails = await Task.find({
        queue: category,
        user: createdBy,
        createdAt: {
          $lt: new Date(),
          $gt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      });

      taskDetailsWithAssignee = await Task.find({
        queue: category,
        assignedTo: createdBy,
        createdAt: {
          $lt: new Date(),
          $gt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    taskDetailsWithAssignee = Array.from(taskDetailsWithAssignee);
    taskDetails = Array.from(taskDetails);

    // for (let index = 0; index < taskDetailsWithAssignee?.length; index++) {
    let taskDetailsWithAssigneeArr = taskDetailsWithAssignee.filter((item) => {
      return item?.user !== createdBy;
    });
    // if (taskDetailsWithAssignee[index].user == createdBy) {
    //   console.log(taskDetailsWithAssignee[index]);
    //   taskDetailsWithAssignee.splice(index, 1);
    // }
    // }

    console.log(
      timeStamp,
      category,
      "taskDetailsWithAssigneeArr",
      taskDetailsWithAssigneeArr,
      "taskDetails",
      taskDetails
    );

    return res.json({
      data: [...taskDetails, ...taskDetailsWithAssigneeArr],
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
    const user = req.query.user || "";
    // console.log(user);

    //todo
    let todoTasks = await Task.find({ queue: "todo", user: user });
    let assignedToDoTasks = await Task.find({
      queue: "todo",
      assignedTo: user,
    });
    assignedToDoTasks = Array.from(assignedToDoTasks);
    let assignedToDoTasksArr = assignedToDoTasks.filter((item) => {
      return item?.user !== user;
    });

    // for (let index in assignedToDoTasks) {
    //   if (assignedToDoTasks[index]?.user == user) {
    //     assignedToDoTasks.splice(index, 1);
    //   }
    // }

    //backlog
    let backlogTasks = await Task.find({ queue: "backlog", user: user });
    let assignedBacklogTasks = await Task.find({
      queue: "backlog",
      assignedTo: user,
    });
    assignedBacklogTasks = Array.from(assignedBacklogTasks);
    let assignedBacklogTasksArr = assignedBacklogTasks.filter((item) => {
      return item?.user !== user;
    });

    // for (let index in assignedBacklogTasks) {
    //   if (assignedBacklogTasks[index]?.user == user) {
    //     assignedBacklogTasks.splice(index, 1);
    //   }
    // }

    //progress
    let progressTasks = await Task.find({ queue: "progress", user: user });
    let assignedProgressTasks = await Task.find({
      queue: "progress",
      assignedTo: user,
    });
    assignedProgressTasks = Array.from(assignedProgressTasks);
    let assignedProgressTasksArr = assignedProgressTasks.filter((item) => {
      return item?.user !== user;
    });

    // for (let index in assignedProgressTasks) {
    //   if (assignedProgressTasks[index]?.user == user) {
    //     assignedProgressTasks.splice(index, 1);
    //   }
    // }

    //completed
    let completedTasks = await Task.find({ queue: "done", user: user });
    let assignedCompletedTasks = await Task.find({
      queue: "done",
      assignedTo: user,
    });
    assignedCompletedTasks = Array.from(assignedCompletedTasks);
    let assignedCompletedTasksArr = assignedCompletedTasks.filter((item) => {
      return item?.user !== user;
    });
    // for (let index in assignedCompletedTasks) {
    //   if (assignedCompletedTasks[index]?.user == user) {
    //     assignedCompletedTasks.splice(index, 1);
    //   }
    // }

    //low priority
    let lowPriority = await Task.find({ priority: "low", user: user });
    let lowPriorityTasks = await Task.find({
      priority: "low",
      assignedTo: user,
    });
    lowPriorityTasks = Array.from(lowPriorityTasks);
    let lowPriorityTasksArr = lowPriorityTasks.filter((item) => {
      return item?.user !== user;
    });
    // for (let index in lowPriorityTasks) {
    //   if (lowPriorityTasks[index]?.user == user) {

    //     lowPriorityTasks.splice(index, 1);
    //   }
    // }

    console.log(
      "lowPriority",
      lowPriority,
      "lowPriorityTasksArr",
      lowPriorityTasksArr
    );

    //moderate
    let moderatePriority = await Task.find({
      priority: "moderate",
      user: user,
    });
    let moderatePriorityTasks = await Task.find({
      priority: "moderate",
      assignedTo: user,
    });
    moderatePriorityTasks = Array.from(moderatePriorityTasks);
    let moderatePriorityTasksArr = moderatePriorityTasks.filter((item) => {
      return item?.user !== user;
    });
    // for (let index in moderatePriorityTasks) {
    //   if (moderatePriorityTasks[index]?.user == user) {
    //     moderatePriorityTasks.splice(index, 1);
    //   }
    // }

    //high
    let highPriority = await Task.find({ priority: "high", user: user });
    let highPriorityTasks = await Task.find({
      priority: "high",
      assignedTo: user,
    });
    highPriorityTasks = Array.from(highPriorityTasks);
    let highPriorityTasksArr = highPriorityTasks.filter((item) => {
      return item?.user !== user;
    });
    // for (let index in highPriorityTasks) {
    //   if (highPriorityTasks[index]?.user == user) {
    //     highPriorityTasks.splice(index, 1);
    //   }
    // }

    let allCreatedTasks = await Task.find({ user: user });
    let allAssignedTasks = await Task.find({
      assignedTo: user,
    });
    allAssignedTasks = Array.from(allAssignedTasks);
    let allAssignedTasksArr = allAssignedTasks.filter((item) => {
      return item?.user !== user;
    });
    // for (let index in allAssignedTasks) {
    //   if (allAssignedTasks[index]?.user == user) {
    //     allAssignedTasks.splice(index, 1);
    //   }
    // }

    let allCreatedNullDateTasks = await Task.find({
      dueDate: null,
      user: user,
    });
    let allAssignedNullDateTasks = await Task.find({
      dueDate: null,
      assignedTo: user,
    });
    allAssignedNullDateTasks = Array.from(allAssignedNullDateTasks);
    let allAssignedNullDateTasksArr = allAssignedNullDateTasks.filter(
      (item) => {
        return item?.user !== user;
      }
    );
    // for (let index in allAssignedNullDateTasks) {
    //   if (allAssignedNullDateTasks[index]?.user == user) {
    //     allAssignedNullDateTasks.splice(index, 1);
    //   }
    // }

    let dueDateTasks =
      allCreatedTasks?.length +
      allAssignedTasksArr?.length -
      (allCreatedNullDateTasks?.length + allAssignedNullDateTasksArr?.length);
    // let allTasks = await Task.find({ user: user });
    // let nullDueDateTasks = await Task.find({ dueDate: null, user: user });
    // let dueDateTasks = allTasks?.length - nullDueDateTasks?.length;

    return res.json({
      data: {
        todoTasks: todoTasks?.length + assignedToDoTasksArr?.length,
        backlogTasks: backlogTasks?.length + assignedBacklogTasksArr?.length,
        progressTasks: progressTasks?.length + assignedProgressTasksArr?.length,
        completedTasks:
          completedTasks?.length + assignedCompletedTasksArr?.length,
        lowPriority: lowPriority?.length + lowPriorityTasksArr?.length,
        moderatePriority:
          moderatePriority?.length + moderatePriorityTasksArr?.length,
        highPriority: highPriority?.length + highPriorityTasksArr?.length,
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
