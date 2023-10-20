import { conectardb, cerrarConexion } from "./db.js";

const sqlCronogramaManteniento = async (condicion = null) => {
    let query = `WITH CTE AS (
        SELECT rm.id_activo, TRIM(pro.nombre_comercial) AS proveedor, rm.proveedor_id, rm.fechareporte,
               ROW_NUMBER() OVER (PARTITION BY rm.id_activo ORDER BY rm.fechareporte DESC) AS rn
        FROM repotesMtto rm
        INNER JOIN proveedores pro
        ON pro.id = rm.proveedor_id
      )
      SELECT la.id, cl.id AS idSigla, TRIM(cl.siglas) AS siglas, TRIM(cl.nombre) AS clasificacion, CONCAT(TRIM(cl.siglas), la.consecutivo_interno) AS codigo, TRIM(la.nombre) AS nombre,
          TRIM(ma.marca) AS marca, TRIM(la.modelo) AS modelo, TRIM(la.serie) AS serie, TRIM(la.ubicacion) AS ubicacion, fr.dias,
          ISNULL(CTE.proveedor, 'Por definir') AS proveedor, CTE.proveedor_id, CTE.fechareporte, la.fecha_proximo_mtto, la.fecha_compra, la.vencimiento_garantia, la.fecha_creacion
      FROM listado_activos la 
      INNER JOIN clasificacion_activos cl
      ON cl.id = la.clasificacion_id
      INNER JOIN marca_activos ma
      ON ma.id = la.marca_id
      INNER JOIN frecuencia_Mtto fr
      ON fr.id = la.frecuencia_id
      LEFT JOIN CTE
      ON CTE.id_activo = la.id AND CTE.rn = 1
      ${condicion}`
    
    try {
        const pool = await conectardb()
        const resultado = await pool.query(query)
        cerrarConexion(pool)
        return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar Consultar los datos, intente mas tarde o valide con el administrador' }
    }
}

export {
    sqlCronogramaManteniento,
}