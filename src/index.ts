import app from "./app.js";
import db from "./database/configurations.js";
import envData from "./env.js";

const port = envData.PORT;

app.listen(port, async ()=>{
    await db.execute("SELECT 1");
    console.log('DB connected successfully');
    console.log(`Server is running on port ${port}`)
})