// const dotenv=require('dotenv');
// dotenv.config();

// const connectDB=require('./src/config/db');
// const app=require('./src/app');


// const startServer =async()=>{
//     try{
//         await connectDB();
//         app.listen(process.env.PORT||5000,()=>{
//           console.log("Server is running on port "+process.env.PORT);
//         })  
//     }
//     catch(err){
//         console.error("Error: "+err.message);
//         process.exit(1);
//     }
// }

// startServer();


const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./src/config/db');
const app = require('./src/app');

const http = require('http');
const { initSocket } = require('./src/socket/socket');

const startServer = async () => {
  try {
    await connectDB();

    // ✅ Create HTTP server
    const server = http.createServer(app);

    // ✅ Initialize socket (ONLY here)
    const io = initSocket(server);

    // ✅ Handle connection
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on("joinBoard", (boardId) => {
  socket.join(`board:${boardId}`);
  console.log(`User ${socket.id} joined board:${boardId}`);
});

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // ✅ Start server
    server.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port " + process.env.PORT);
    });

  } catch (err) {
    console.error("Error: " + err.message);
    process.exit(1);
  }
};

startServer();