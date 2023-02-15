import express   from "express";
import dotenv from "dotenv";
import conectardb from "./db/db.js";
import router from "./routes/routes.js";

const app = express();
dotenv.config();

conectardb();
//define port
const PORT = process.env.PORT || 4000;

// add router

app.use('/api/mantenimiento', router)

// initialize server
app.listen(PORT, () => {
  console.log(`The server is runing in http://localhost:${PORT}`);
    
});