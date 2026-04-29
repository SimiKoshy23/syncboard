const {createBoard,getBoards} = require('./board.controller');
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/AuthMiddleware');

router.post('/', authMiddleware, createBoard);
router.get('/', authMiddleware, getBoards);

module.exports = router;