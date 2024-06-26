const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
    },
    queue: {
      type: String,
      required: true,
    },
    tasks: {
      type: Array,
    },
    dueDate: {
      type: String,
    },
    user: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Task", taskSchema);
