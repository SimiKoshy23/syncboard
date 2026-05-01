const mongoose = require("mongoose");
const taskModel = require("../../models/task.model");
const membershipModel = require("../../models/membership.model");
const listModel = require("../../models/list.model");
const { getIO } = require('../../socket/socket');



exports.createTask = async (req, res) => {
  try {
    const io = getIO();
    const { title, description, boardId, listId, assignedTo } = req.body;

    // Basic validation
    if (!title || !boardId || !listId) {
      return res
        .status(400)
        .json({ message: "Title, boardId and listId are required" });
    }

    // ObjectId validation
    if (
      !mongoose.Types.ObjectId.isValid(boardId) ||
      !mongoose.Types.ObjectId.isValid(listId) ||
      (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo))
    ) {
      return res.status(400).json({ message: "Invalid IDs provided" });
    }

    const userId = req.user.userId;

    // Authorization: user must be member of board
    const member = await membershipModel.findOne({ boardId, userId });
    if (!member) {
      return res
        .status(403)
        .json({ message: "You are not a member of this board" });
    }

    // Data integrity: list must belong to board
    const list = await listModel.findOne({ _id: listId, boardId });
    if (!list) {
      return res
        .status(400)
        .json({ message: "List does not exist in this board" });
    }

    // (Optional but strong) assignedTo must be a member of the board
    if (assignedTo) {
      const assigneeMember = await membershipModel.findOne({
        boardId,
        userId: assignedTo,
      });
      if (!assigneeMember) {
        return res
          .status(400)
          .json({ message: "Assignee is not a member of this board" });
      }
    }

    // Order calculation (within the list)
    const lastTask = await taskModel.findOne({ listId }).sort({ order: -1 });

    const newOrder = lastTask ? lastTask.order + 1 : 1;

    // Create task
    const newTask = await taskModel.create({
      title,
      description,
      boardId,
      listId,
      ...(assignedTo && { assignedTo }),
      order: newOrder,
    });

    io.to(`board:${boardId}`).emit("taskCreated", newTask);

    res.status(201).json({
      message: "Task created successfully",
      taskId: newTask._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating task" });
  }
};


exports.getTasksByList = async (req, res) => {
  try {
    const { listId } = req.params;

    if (!listId || !mongoose.Types.ObjectId.isValid(listId)) {
      return res.status(400).json({ message: 'Valid listId is required' });
    }

    const userId = req.user.userId;

    const list = await listModel.findById(listId);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const member = await membershipModel.findOne({
      boardId: list.boardId,
      userId,
    });

    if (!member) {
      return res.status(403).json({
        message: 'You are not a member of this board',
      });
    }

    const tasks = await taskModel
      .find({ listId })
      .sort({ order: 1 })
      .populate('assignedTo', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      data: tasks, // ✅ fixed
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

exports.moveTask = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const io = getIO();
    const { taskId } = req.params;
    const { targetListId, targetOrder } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(targetListId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = req.user.userId;

    const member = await membershipModel.findOne({
      boardId: task.boardId,
      userId,
    });

    if (!member) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const oldListId = task.listId.toString();
    const oldOrder = task.order;

    await session.startTransaction();

    if (oldListId === targetListId) {
      // SAME LIST

      if (targetOrder < oldOrder) {
        await taskModel.updateMany(
          {
            listId: oldListId,
            order: { $gte: targetOrder, $lt: oldOrder },
          },
          { $inc: { order: 1 } },
          { session }
        );
      } else {
        await taskModel.updateMany(
          {
            listId: oldListId,
            order: { $gt: oldOrder, $lte: targetOrder },
          },
          { $inc: { order: -1 } },
          { session }
        );
      }

    } else {
      // DIFFERENT LIST

      // Source list shift up
      await taskModel.updateMany(
        {
          listId: oldListId,
          order: { $gt: oldOrder },
        },
        { $inc: { order: -1 } },
        { session }
      );

      // Destination list shift down
      await taskModel.updateMany(
        {
          listId: targetListId,
          order: { $gte: targetOrder },
        },
        { $inc: { order: 1 } },
        { session }
      );
    }

    // Finally update moved task
    task.listId = targetListId;
    task.order = targetOrder;

    await task.save({ session });

    await session.commitTransaction();
    io.to(`board:${task.boardId}`).emit("taskMoved", {
  taskId,
  targetListId,
  targetOrder
});

    res.status(200).json({ message: "Task moved successfully" });

  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: "Error moving task" });
  } finally {
    session.endSession();
  }
};