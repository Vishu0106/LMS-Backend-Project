import mongoose from "mongoose";

mongoose.set('strictQuery', false);

export const connectToDB = async () => {
    try {
        const connection = await mongoose.connect(
            process.env.MONGO_URI
        );
        if(connection) {
            console.log(`Connecton to MONGO_DB : ${connection.host}`)
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}