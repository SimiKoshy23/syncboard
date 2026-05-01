const {createTask,getTasksByList,moveTask} = require('./task.controller');
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/AuthMiddleware');

router.post('/', authMiddleware, createTask);
router.get('/list/:listId', authMiddleware, getTasksByList);
router.post('/move/:taskId', authMiddleware, moveTask);

module.exports = router;