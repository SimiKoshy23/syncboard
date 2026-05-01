const {createList,getListsByBoard} = require('./list.controller');
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/AuthMiddleware');

router.post('/', authMiddleware, createList);
router.get('/:boardId', authMiddleware, getListsByBoard);

module.exports = router;