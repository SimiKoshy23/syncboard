const boardModel = require('../../models/board.model');
const membershipModel = require('../../models/membership.model');

exports.createBoard = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const userId = req.user.userId;

    const newBoard = await boardModel.create({
      title,
      createdBy: userId,
    });

    await membershipModel.create({
      userId,
      boardId: newBoard._id,
      role: 'admin',
    });

    res.status(201).json({
      message: "Board created successfully",
      boardId: newBoard._id,
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getBoards = async (req, res) => {
  try {
    const userId = req.user.userId;

    const memberships = await membershipModel
      .find({ userId })
      .populate('boardId', 'title createdBy createdAt');

    const boards = memberships
      .map(m => m.boardId)
      .filter(Boolean); // remove nulls

    res.status(200).json({
      success: true,
      data: boards,
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};