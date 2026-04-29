const dotenv=require('dotenv');
dotenv.config();

const connectDB=require('./src/config/db');
const app=require('./src/app');


const startServer =async()=>{
    try{
        await connectDB();
        app.listen(process.env.PORT||5000,()=>{
          console.log("Server is running on port "+process.env.PORT);
        })  
    }
    catch(err){
        console.error("Error: "+err.message);
        process.exit(1);
    }
}

startServer();

