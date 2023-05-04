import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const config = {
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  database: process.env.NAME_DB,
  server: process.env.HOST_DB,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

const conectardb = async () => {
  try {
    console.log(config);
    const pool = await sql.connect(config);
    console.log("Conectado a  la base de datos");
    return pool;
  } catch (error) {
    console.error(error);
  }
};

const cerrarConexion = async (pool) => {
  try {
    await pool.close();
    console.log("Conexión cerrada correctamente");
  } catch (error) {
    console.error(error);
  }
};

export default conectardb;
