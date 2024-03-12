import express   from "express";
import bodyParser from "body-parser"
import dotenv from "dotenv";
import {conectardb} from "./db/db.js";
import router from "./routes/routes.js";

dotenv.config()

const app = express();

app.use(express.raw({limit: '20mb'}))
app.use(bodyParser.json({ limit: '20mb'}));
app.set('trust proxy', true)
app.use(express.json())

conectardb();
//define port
const PORT = process.env.PORT || 4000;

// add router

app.use('/api/mantenimiento', router)

// initialize server
app.listen(PORT, () => {
  console.log(`The server is runing in http://localhost:${PORT}`);
    
});