import app from "./app.js";
import { connectToDB } from "./config/dbConnection.js";
import cloudinary from "cloudinary";
import Razorpay from 'razorpay';
import {config} from "dotenv"
config()



const PORT = process.env.PORT || 5000;

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    api_key: process.env.CLOUDINARY_API_KEY
})

export const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_SECRET
})

app.listen(PORT, ()=> {
    connectToDB()
    console.log(`App sis runinng at http//:localhost:${PORT}`);
})
