const express=require('express');
const authRoutes = require('../src/modules/auth/auth.route');
const boardRoutes = require('../src/modules/board/board.route');
const listRoutes = require('../src/modules/list/list.routes');
const taskRoutes = require('../src/modules/task/task.route');

const app=express();

const cors=require('cors');
app.use(express.json());
app.use(cors());


app.get('/',(req,res)=>{
    console.log("API is running...");
    res.send("API is running...");
})

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/list', listRoutes);
app.use('/api/task', taskRoutes);


module.exports=app;