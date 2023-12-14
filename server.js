import app from "./app.js";
import { connectToDB } from "./config/dbConnection.js";
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> {
    connectToDB()
    console.log(`App sis runinng at http:localhost:${PORT}`);
})
