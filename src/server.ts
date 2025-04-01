import express  from 'express';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config()
const app=express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin:'http://localhost:4200'}))

const port = process.env.PORT
app.listen(port,()=>{
    console.log("Server is running on port: ", port);
})
