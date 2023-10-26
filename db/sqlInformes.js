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

const sqlListadoActivoCosteado = async (condicion = null) => {
    let query = `
        SELECT la.id, TRIM(cl.siglas) AS sigla, cl.id AS idSigla, TRIM(cl.nombre) AS clasificacion ,CONCAT(TRIM(cl.siglas), la.consecutivo_interno) AS codigo,
            TRIM(la.nombre) AS nombre, TRIM(ma.marca) AS marca, TRIM(la.modelo) AS modelo, TRIM(la.serie) AS serie, TRIM(es.estado) AS estado,
            TRIM(pro.proceso) AS proceso, TRIM(ar.area) AS area, TRIM(la.ubicacion) AS ubicacion,  ISNULL(la.valor,0) AS valor,
            CONCAT(TRIM(us.nombre), SPACE(1), TRIM(us.nombre_1),  SPACE(1), TRIM(us.apellido),  SPACE(1), TRIM(us.apellido_1)) AS usuario,
            ISNULL((SELECT SUM(rm.costo_mo) FROM repotesMtto rm WHERE rm.id_activo = la.id), 0) AS totalMo,
            ISNULL((SELECT SUM(rm.costo_mp) FROM repotesMtto rm WHERE rm.id_activo = la.id), 0) AS totalMp
                FROM listado_activos la 
                INNER JOIN clasificacion_activos cl
                ON cl.id = la.clasificacion_id
                INNER JOIN marca_activos ma
                ON ma.id = la.marca_id
                INNER JOIN procesos pro
                ON pro.id = la.proceso_id
                INNER JOIN areas ar
                ON ar.id = la.area_id
                INNER JOIN usuarios us
                ON us.id = la.usuario_id
                INNER JOIN estados es
                ON es.id  = la.estado_id
        ${condicion}
      `
    
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

const sqlInformeListadoActivo = async (condicion = null) => {
    let query = `
        SELECT la.id, TRIM(cl.siglas) AS sigla, cl.id AS idSigla, TRIM(cl.nombre) AS clasificacion ,CONCAT(TRIM(cl.siglas), la.consecutivo_interno) AS codigo,
            TRIM(la.nombre) AS nombre, TRIM(ma.marca) AS marca, TRIM(la.modelo) AS modelo, TRIM(la.serie) AS serie, TRIM(es.estado) AS estado,
            TRIM(pro.proceso) AS proceso, TRIM(ar.area) AS area, TRIM(la.ubicacion) AS ubicacion,
            CONCAT(TRIM(us.nombre), SPACE(1), TRIM(us.nombre_1),  SPACE(1), TRIM(us.apellido),  SPACE(1), TRIM(us.apellido_1)) AS usuario
                    FROM listado_activos la 
                INNER JOIN clasificacion_activos cl
                ON cl.id = la.clasificacion_id
                INNER JOIN marca_activos ma
                ON ma.id = la.marca_id
                INNER JOIN procesos pro
                ON pro.id = la.proceso_id
                INNER JOIN areas ar
                ON ar.id = la.area_id
                INNER JOIN usuarios us
                ON us.id = la.usuario_id
                INNER JOIN estados es
                ON es.id  = la.estado_id
        ${condicion}
      `
    
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

const sqlInformeListadoReportes = async condicion=> {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT rm.id AS idReporte, rm.solicitud_id AS idSolicitud, CONCAT(TRIM(ca.siglas), la.consecutivo_interno) AS codigoInterno,
            TRIM(la.nombre) AS nombreACtivo, TRIM(ma.marca) AS marca, TRIM(la.modelo) AS modelo, TRIM(la.serie) AS serie, 
            CONCAT(TRIM(us.nombre), SPACE(1), TRIM(us.nombre_1), SPACE(1) , TRIM(us.apellido), SPACE(1), TRIM(us.apellido_1)) AS solicitante,
            CONCAT(TRIM(usr.nombre), SPACE(1), TRIM(usr.nombre_1), SPACE(1) , TRIM(usr.apellido), SPACE(1), TRIM(usr.apellido_1)) AS realizo,
            CONCAT(TRIM(usrr.nombre), SPACE(1), TRIM(usrr.nombre_1), SPACE(1) , TRIM(usrr.apellido), SPACE(1), TRIM(usrr.apellido_1)) AS recibido,
            TRIM(la.ubicacion) AS ubicacion, TRIM(es.estado) AS estado, rm.fechareporte, TRIM(sm.solicitud) AS solicitud, sm.fecha_solicitud,
            TRIM(rm.hallazgos) AS hallazgos, TRIM(rm.reporte) AS reporte, TRIM(rm.recomendaciones) AS recomendaciones, rm.costo_mo, costo_mp,
            rm.fechaCierre, TRIM(pro.nombre_comercial) AS proveedor
                FROM repotesMtto rm
                INNER JOIN listado_activos la
                ON la.id = rm.id_activo
                INNER JOIN clasificacion_activos ca
                ON ca.id = la.clasificacion_id
                INNER JOIN marca_activos ma
                ON ma.id = la.marca_id
                INNER JOIN solicitudes_mtto sm
                ON sm.id = rm.solicitud_id
                INNER JOIN usuarios us
                ON us.id = sm.id_usuario
                INNER JOIN usuarios usr
                ON usr.id = rm.usuario_idReporte
                INNER JOIN usuarios usrr
                ON usrr.id = rm.usuario_idaprovado
                INNER JOIN estado_solicitudes es
                ON es.id = sm.id_estado
                INNER JOIN proveedores pro
                ON pro.id = rm.proveedor_id
            ${condicion} 
        `)
        cerrarConexion(pool)
        return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar los datos intentalo mas tarde' }
    }
}

const sqlInformeListadoSolicitud = async condicion => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT sm.id, CONCAT(TRIM(cl.siglas), la.consecutivo_interno) as codigoInterno,TRIM(la.nombre) AS nombreActivo, TRIM(la.modelo) AS modelo,
            TRIM(ma.marca) AS marca, TRIM(la.serie) AS serie, TRIM(la.ubicacion) AS ubicacion, sm.fecha_solicitud, TRIM(sm.solicitud) AS solicitud,
            CONCAT(TRIM(us.nombre), space(1), TRIM(us.nombre_1), space(1), TRIM(us.apellido), space(1), TRIM(us.apellido_1)) AS solicitante,
            TRIM(es.estado) AS estado FROM solicitudes_mtto sm
                INNER JOIN listado_activos la
                ON sm.id_activo = la.id
                INNER JOIN clasificacion_activos cl
                ON cl.id = la.clasificacion_id
                INNER JOIN marca_activos ma
                ON ma.id = la.marca_id
                INNER JOIN estado_solicitudes es
                ON es.id = sm.id_estado
                INNER JOIN usuarios us
                ON us.id = sm.id_usuario
            ${condicion}
        `)
        cerrarConexion(pool)
        return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar el activo' }
    }
}

export {
    sqlCronogramaManteniento,
    sqlListadoActivoCosteado,
    sqlInformeListadoActivo,
    sqlInformeListadoReportes,
    sqlInformeListadoSolicitud
}