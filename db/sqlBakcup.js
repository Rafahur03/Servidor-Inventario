import { conectardb, cerrarConexion } from "./db.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

export async function ejecutarBackup() {
  try {
    // 1️⃣ Definir rutas
    const localBackupDir = path.resolve("./backup");
    const driveBackupDir = path.join(process.env.PATH_FILES, "Backups");

    // Crear carpeta local si no existe
    if (!fs.existsSync(localBackupDir)) {
      fs.mkdirSync(localBackupDir, { recursive: true });
      console.log("📁 Carpeta local 'backup' creada.");
    }

    const pool = await conectardb();
    console.log("✅ Conectado a SQL Server. Ejecutando respaldo...");

    // 2️⃣ Nombre de archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `Solicitud_de_soporte_${timestamp}.bak`;
    const localFilePath = path.join(localBackupDir, filename);

    // 3️⃣ Escapar correctamente la ruta para SQL Server
    const sqlPath = localFilePath.replace(/\\/g, "\\\\"); // ✅ doble barra invertida

    const query = `
      BACKUP DATABASE [Solicitud_de_soporte]
      TO DISK = N'${sqlPath}'
      WITH FORMAT, INIT, NAME = N'Solicitud_de_soporte-Backup',
      SKIP, NOREWIND, NOUNLOAD, STATS = 10;
    `;

    // Ejecutar backup
    console.time("⏳ Tiempo total de respaldo");
    await pool.request().query(query);
    console.timeEnd("⏳ Tiempo total de respaldo");
    console.log("💾 Respaldo creado correctamente en:", localFilePath);

    await cerrarConexion(pool);

    // 4️⃣ Copiar a Google Drive
    if (!fs.existsSync(driveBackupDir)) {
      fs.mkdirSync(driveBackupDir, { recursive: true });
      console.log("📁 Carpeta destino en Drive creada.");
    }

    const driveFilePath = path.join(driveBackupDir, filename);
    fs.copyFileSync(localFilePath, driveFilePath);
    console.log("🚀 Backup copiado a:", driveFilePath);

    // 5️⃣ (Opcional) Borrar copia local
    // fs.unlinkSync(localFilePath);
    // console.log("🧹 Copia local eliminada.");

  } catch (err) {
    console.error("❌ Error ejecutando el backup:", err.message);
  }
}
