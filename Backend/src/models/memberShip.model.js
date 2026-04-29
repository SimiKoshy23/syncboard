const mongoose=require('mongoose');

const memberShipSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    boardId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Board',
        required:true
    },
    role:{
        type:String,
        enum:['admin','member'],
        default:'member',
        required:true
    },
},
  {
    timestamps: true,
  
});

memberShipSchema.index({ userId: 1, boardId: 1 }, { unique: true });
const MemberShip=mongoose.model('MemberShip',memberShipSchema);

module.exports=MemberShip;