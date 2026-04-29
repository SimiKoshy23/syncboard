const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    boardId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Board',
        required:true
    },
    order:{
        type:Number,
        required:true
    },
},
{
    timestamps:true
});

listSchema.index({ boardId: 1 });

const List = mongoose.model('List', listSchema);
module.exports = List;