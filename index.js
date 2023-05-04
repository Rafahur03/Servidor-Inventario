import express   from "express";
import dotenv from "dotenv";
import conectardb from "./db/db.js";
import router from "./routes/routes.js";
dotenv.config();
const app = express();

app.use(express.raw({limit: '50mb'}))
app.use(express.json())

console.log( process.env.USER_DB)
conectardb();
//define port
const PORT = process.env.PORT || 4000;

// add router

app.use('/api/mantenimiento', router)

// initialize server
app.listen(PORT, () => {
  console.log(`The server is runing in http://localhost:${PORT}`);
    
});