import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/user.routes.js"
import courseRoute from './routes/course.routes.js'
import paymentRoute from './routes/payment.routes.js'
import {errorMiddleware} from "./middlewares/error.middleware.js"
import miscRoutes from "./routes/miscellaneous.routes.js"
import morgan from "morgan";
import {config} from "dotenv"
config()



const app = express();

app.use(express.json()); // accept the json data

app.use(cors(*))

app.use(morgan('dev'));
app.use(cookieParser());

app.use('/ping',(req,res)=>{
    res.send('pong')
});

// 3 route config

app.use('/api/v1/user',userRoute)
app.use('/api/v1/courses',courseRoute)
app.use('/api/v1/payments',paymentRoute)
app.use('/api/v1', miscRoutes);

app.all('*',(req,res)=>{
    res.status(404).send('OOPS!! 404 page not found');
})

app.use(errorMiddleware);


export default app;



