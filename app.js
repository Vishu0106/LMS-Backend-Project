import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json()); // accept the json data

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true
}));
app.use(cookieParser());

app.use('/ping',(req,res)=>{
    res.send('pong')
});

app.all('*',(req,res)=>{
    res.status(404).send('OOPS!! 404 page not found');
})


export default app;



