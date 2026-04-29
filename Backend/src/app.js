const express=require('express');
const app=express();

const cors=require('cors');
app.use(express.json());
app.use(cors());


app.get('/',(req,res)=>{
    console.log("API is running...");
    res.send("API is running...");
})


module.exports=app;