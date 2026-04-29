const mongoose=require('mongoose');

const boardSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
},
{
    timeStamps:true
}
);


const Board=mongoose.model('Board',boardSchema);

module.exports=Board;