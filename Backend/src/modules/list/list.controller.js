const listModel = require("../../models/list.model");
const membershipModel = require("../../models/membership.model");
const mongoose = require("mongoose");

const { getIO } = require('../../socket/socket');


exports.createList = async (req, res) => {
  try {
    const io = getIO();
    const { title, boardId } = req.body;
    if (!title || !boardId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const userId = req.user.userId;
    // ✅ Authorization check
    const member = await membershipModel.findOne({ userId, boardId });

    if (!member) {
      return res
        .status(403)
        .json({ message: "You are not a member of this board" });
    }

    // ✅ Order calculation
    const lastList = await listModel.findOne({ boardId }).sort({ order: -1 });

    const newOrder = lastList ? lastList.order + 1 : 1;

    // ✅ Create list
    const newList = await listModel.create({
      title,
      boardId,
      order: newOrder,
    });

    io.to(`board:${boardId}`).emit("listCreated", newList);

    res.status(201).json({
      message: "List created successfully",
      listId: newList._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getListsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    if (!boardId) {
      return res.status(400).json({ message: "Board ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ message: "Invalid board ID" });
    }
    const userId = req.user.userId;
    // ✅ Authorization check
    const member = await membershipModel.findOne({ userId, boardId });

    if (!member) {
      return res
        .status(403)
        .json({ message: "You are not a member of this board" });
    }
    const lists = await listModel
      .find({ boardId }, "title order createdAt")
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: lists,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
