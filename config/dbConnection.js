import mongoose from "mongoose";

mongoose.set('strictQuery', false);

export const connectToDB = async () => {
    try {
        const dbInstance = await mongoose.connect(
            `${process.env.MONGO_URI}/lms`
        );
        if(dbInstance) {
            console.log(`Connecton to MONGO_DB : ${dbInstance.connection.host}`)
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}