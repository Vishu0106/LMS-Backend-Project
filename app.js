import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/user.routes.js"
import courseRoute from './routes/course.routes.js'
import {errorMiddleware} from "./middlewares/error.middleware.js"
import morgan from "morgan";



const app = express();

app.use(express.json()); // accept the json data

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true
}));

app.use(morgan('dev'));
app.use(cookieParser());

app.use('/ping',(req,res)=>{
    res.send('pong')
});

// 3 route config

app.use('/api/v1/user',userRoute)
app.use('/api/v1/courses',courseRoute)

app.all('*',(req,res)=>{
    res.status(404).send('OOPS!! 404 page not found');
})

app.use(errorMiddleware);


export default app;



