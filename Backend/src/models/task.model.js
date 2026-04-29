const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true, 
    },
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, 
    order: {
        type: Number,
        required: true
    },
}, {
    timestamps: true
});

taskSchema.index({ boardId: 1 });
taskSchema.index({ listId: 1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;