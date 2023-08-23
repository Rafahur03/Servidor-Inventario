import { conectardb, cerrarConexion } from "./db.js";

const consultarReportes = async () => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT rm.id AS idReporte, rm.solicitud_id AS idSolicitud, CONCAT(TRIM(ca.siglas), la.consecutivo_interno) AS codigoInterno,
            TRIM(la.nombre) AS nombreACtivo, TRIM(ma.marca) AS marca, TRIM(la.modelo) AS modelo, TRIM(la.ubicacion) AS ubicacion, 
            CONCAT(TRIM(us.nombre), SPACE(1), TRIM(us.nombre_1), SPACE(1) , TRIM(us.apellido), SPACE(1), TRIM(us.apellido_1)) AS solicitante,
            TRIM(es.estado) AS estado, rm.fechareporte
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
                INNER JOIN estado_solicitudes es
                ON es.id = sm.id_estado
                WHERE sm.id_estado <> '4'
            
            ORDER BY sm.id_estado ASC, idReporte DESC
        `)
        cerrarConexion(pool)
        return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar los datos intentalo mas tarde' }
    }
}

const consultarReporteUno = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT * FROM repotesMtto
            WHERE id ='${id}'
        `)
        cerrarConexion(pool)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los dato' }
    }
}

const guardarReporte = async (data) => {

    try {

        const pool = await conectardb()
        let resultado
        if (data.estadoSolicitudId = 3) {
            resultado = await pool.query(`
                INSERT INTO repotesMtto (solicitud_id, tipoMtoo_id, fechareporte, costo_mo, costo_mp, proveedor_id, usuario_idReporte, usuario_idaprovado, hallazgos, reporte, recomendaciones, id_activo, fechaCreacion, fechaCierre )
                    VALUES ('${data.idSolicitud}', '${data.tipoMantenimientoId}', '${data.fechaReporte}', '${data.costoMo}', '${data.costoMp}', '${data.provedorMttoId}', '${data.usuario_idReporte}', '${data.recibidoConformeId}', '${data.hallazgos}', '${data.reporte}', '${data.recomendaciones}', '${data.id_activo}', '${data.fechaCreacion}, '${data.fechaCierre}')
                SELECT IDENT_CURRENT('repotesMtto') AS id
            `)
        } else {
            resultado = await pool.query(`
                INSERT INTO repotesMtto (solicitud_id, tipoMtoo_id, fechareporte, costo_mo, costo_mp, proveedor_id, usuario_idReporte, usuario_idaprovado, hallazgos, reporte, recomendaciones, id_activo, fechaCreacion)
                    VALUES ('${data.idSolicitud}', '${data.tipoMantenimientoId}', '${data.fechaReporte}', '${data.costoMo}', '${data.costoMp}', '${data.provedorMttoId}', '${data.usuario_idReporte}', '${data.recibidoConformeId}', '${data.hallazgos}', '${data.reporte}', '${data.recomendaciones}', '${data.id_activo}', '${data.fechaCreacion}')
                SELECT IDENT_CURRENT('repotesMtto') AS id
            `)
        }


        const actualziarEstadoSolicitud = await pool.query(`
            UPDATE solicitudes_mtto
                SET id_estado = '${data.id_estado}'
            WHERE id = '${data.solicitud_id}'
        `)
        cerrarConexion(pool)
        return (resultado.recordset[0].id)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar el reporte, verifique si se guardo en caso contrario intentelo nuevamente' }
    }
}

const actualizarReporte = async (data) => {

    try {

        const pool = await conectardb()
        let resultado
        if (data.id_estado === 3) {
            resultado = await pool.query(`
            UPDATE repotesMtto
                SET tipoMtoo_id = '${data.tipoMtoo_id}' , fechareporte = '${data.fechareporte}', costo_mo = '${data.costo_mo}', costo_mp = '${data.costo_mp}', proveedor_id = '${data.proveedor_id}', usuario_idaprovado = '${data.usuario_idaprovado}', hallazgos = '${data.hallazgos}', reporte = '${data.reporte}', recomendaciones = '${data.recomendaciones}', img_reporte = '${data.img_reporte}', fechaCierre = '${data.fechaCierre}'
             WHERE id =  '${data.id}'            
        `)
        } else {
            resultado = await pool.query(`
            UPDATE repotesMtto
                SET tipoMtoo_id = '${data.tipoMtoo_id}' , fechareporte = '${data.fechareporte}', costo_mo = '${data.costo_mo}', costo_mp = '${data.costo_mp}', proveedor_id = '${data.proveedor_id}', usuario_idaprovado = '${data.usuario_idaprovado}', hallazgos = '${data.hallazgos}', reporte = '${data.reporte}', recomendaciones = '${data.recomendaciones}', img_reporte = '${data.img_reporte}'
             WHERE id =  '${data.id}'        
        `)

        }


        await pool.query(`
            UPDATE solicitudes_mtto
                SET id_estado = '${data.id_estado}'
            WHERE id = '${data.solicitud_id}'
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar el reporte, verifique si se guardo en caso contrario intentelo nuevamente' }
    }
}
const consultarReportesActivo = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT rm.id, rm.fechareporte, TRIM(rm.hallazgos) AS hallazgos, TRIM(rm.reporte) AS reporte,
                TRIM(rm.recomendaciones) AS recomendaciones, TRIM(pro.nombre_comercial) AS proveedor, rm.proximoMtto,
                TRIM(tm.tipoMtto) as tipoMantenimeinto
                FROM repotesMtto rm
                INNER JOIN proveedores PRO
                ON pro.id = rm.proveedor_id 
                INNER JOIN tipo_mantenimeintos tm
                ON tm.id = rm.tipoMtoo_id
                INNER JOIN solicitudes_mtto sm
	            ON sm.id = rm.solicitud_id
            WHERE rm.id_activo = ${id} AND sm.id_estado <> 4
            ORDER BY fechareporte DESC
            
        `)
        cerrarConexion(pool)
        return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar los datos intentalo mas tarde' }
    }
}

const actualizarImagenesReporte = async (data) => {

    try {

        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE repotesMtto
                SET img_reporte='${data.img_reporte}'
            WHERE id = '${data.id}'
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar el activo' }
    }
}

const dataConfReporte = async () => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT id, TRIM(estado) AS estado FROM estados
            SELECT id, TRIM(tipoMtto) AS tipoMtto FROM tipo_mantenimeintos WHERE estado_id !=3
            SELECT id, TRIM(estado) AS estado FROM estado_solicitudes
            SELECT id, TRIM(nombre_comercial) AS nombre_comercial, TRIM(razon_social) AS razon_social, TRIM(nit) AS nit FROM proveedores WHERE estado !=3
            SELECT id, CONCAT(TRIM(nombre),SPACE(1), TRIM(nombre_1),SPACE(1), TRIM(apellido), SPACE(1), TRIM(apellido_1)) AS nombre FROM usuarios WHERE estado !=3
        `)
        cerrarConexion(pool)
        return (resultado.recordsets)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar los datos intentalo mas tarde' }
    }
}

export {
    consultarReportes,
    consultarReporteUno,
    guardarReporte,
    actualizarReporte,  
    consultarReportesActivo,
    dataConfReporte,
    actualizarImagenesReporte
}