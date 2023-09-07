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

const consultarReportevalidacion = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT rm.id AS idReporte, rm.id_activo AS idActivo, rm.solicitud_id AS idSolicitud, so.id_estado AS estadoSolicitudId, TRIM(rm.img_reporte) AS imgReporte, rm.usuario_idReporte AS usuarioReporteId, so.fecha_solicitud AS fechaSolicitud, rm.repIntExte AS repIntExte
                FROM repotesMtto rm
                INNER JOIN solicitudes_mtto so
                ON so.id = rm.solicitud_id
            WHERE rm.id ='${id}'
        `)
        cerrarConexion(pool)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return { msg: 'No fue posible validar la informaciondel reporte, Ha ocurido un error al intentar consultar los datos del reporte' }
    }
}

const consultarReporteUno = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT rm.id AS idReporte, rm.id_activo AS idActivo, rm.solicitud_id AS idSolicitud, rm.tipoMtoo_id AS tipoMttoId,
                rm.proveedor_id AS proveedorMttoId,	rm.usuario_idaprovado AS recibidoConformeId, rm.fechareporte AS fechaReporte,
                rm.usuario_idReporte AS usuarioReporteId, rm.costo_mo AS costoMo, rm.costo_mp AS costoMp, TRIM(pro.nit) AS nit,
                rm.proximoMtto, TRIM(rm.hallazgos) AS hallazgos, TRIM(rm.reporte) AS reporte, TRIM(rm.recomendaciones) AS recomendaciones,
                TRIM(rm.img_reporte) AS imgReporte, TRIM(la.nombre) AS nombre, la.estado_id AS estadoActivoId, TRIM(ma.marca) AS marca,
                TRIM(la.serie) AS serie, TRIM(la.modelo) as modelo, TRIM(la.ubicacion) AS ubicacion, TRIM(ess.estado) AS estadoSolicitud,
                CONCAT(TRIM(ca.siglas) , TRIM(la.consecutivo_interno)) AS codigo, TRIM(pr.proceso) AS proceso, TRIM(ta.tipo_activo) AS tipoActivo,
                TRIM(ar.area) AS area, TRIM(es.estado) AS estadoActivo, so.fecha_solicitud AS fechaSolicitud, TRIM(tm.tipoMtto) AS tipoMtto,
                CONCAT(TRIM(pro.razon_social),'--' ,TRIM(pro.nombre_comercial),'--', TRIM(pro.nit)) as proveedor, so.id_estado AS estadoSolicitudId,
                CONCAT (TRIM(us.nombre), SPACE(1) ,TRIM(us.nombre_1), SPACE(1) ,TRIM(us.apellido), SPACE(1) ,TRIM(us.apellido_1)) AS usuarioRecibido,
                CONCAT (TRIM(usr.nombre), SPACE(1) ,TRIM(usr.nombre_1), SPACE(1) ,TRIM(usr.apellido), SPACE(1) ,TRIM(usr.apellido_1)) AS usuarioReporte,
                TRIM(la.url_img) AS imgActivo, rm.repIntExte, TRIM(so.solicitud) AS solicitud		
                FROM repotesMtto rm
                INNER JOIN listado_activos la
                ON la.id = rm.id_activo
                INNER JOIN marca_activos ma
                ON ma.id = la.marca_id
                INNER JOIN clasificacion_activos ca
                ON ca.id = la.clasificacion_id
                INNER JOIN procesos pr
                ON pr.id = la.proceso_id
                INNER JOIN tipo_activo ta
                ON ta.id = la.tipo_activo_id
                INNER JOIN areas ar
                ON ar.id = la.area_id
                INNER JOIN estados es
                ON es.id = la.estado_id
                INNER JOIN solicitudes_mtto so
                ON so.id = rm.solicitud_id
                INNER JOIN tipo_mantenimeintos tm
                ON tm.id = rm.tipoMtoo_id
                INNER JOIN proveedores pro
                ON pro.id = rm.proveedor_id
                INNER JOIN usuarios AS us
                ON us.id = rm.usuario_idaprovado
                INNER JOIN usuarios AS usr
                ON usr.id = rm.usuario_idReporte
                INNER JOIN estado_solicitudes ess
                ON ess.id = so.id_estado
            WHERE rm.id ='${id}'
        `)
        cerrarConexion(pool)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los datos del reporte' }
    }
}

const guardarReporte = async (data) => {

    try {

        const pool = await conectardb()

        let resultado
        if (data.id_estado == 3) {
            resultado = await pool.query(`
                INSERT INTO repotesMtto (solicitud_id, tipoMtoo_id, fechareporte, costo_mo, costo_mp, proveedor_id, usuario_idReporte, usuario_idaprovado, hallazgos, reporte, recomendaciones, id_activo, fechaCreacion, fechaCierre, proximoMtto )
                    VALUES ('${data.idSolicitud}', '${data.tipoMantenimientoId}', '${data.fechaReporte}', '${data.costoMo}', '${data.costoMp}', '${data.provedorMttoId}', '${data.usuario_idReporte}', '${data.recibidoConformeId}', '${data.hallazgos}', '${data.reporte}', '${data.recomendaciones}', '${data.id_activo}', '${data.fechaCreacion}', '${data.fechaCierre}', '${data.fechaproximoMtto}')
                SELECT IDENT_CURRENT('repotesMtto') AS id
            `)
        } else {
            resultado = await pool.query(`
                INSERT INTO repotesMtto (solicitud_id, tipoMtoo_id, fechareporte, costo_mo, costo_mp, proveedor_id, usuario_idReporte, usuario_idaprovado, hallazgos, reporte, recomendaciones, id_activo, fechaCreacion, proximoMtto)
                    VALUES ('${data.idSolicitud}', '${data.tipoMantenimientoId}', '${data.fechaReporte}', '${data.costoMo}', '${data.costoMp}', '${data.provedorMttoId}', '${data.usuario_idReporte}', '${data.recibidoConformeId}', '${data.hallazgos}', '${data.reporte}', '${data.recomendaciones}', '${data.id_activo}', '${data.fechaCreacion}', '${data.fechaproximoMtto}')
                SELECT IDENT_CURRENT('repotesMtto') AS id
            `)
        }

        cerrarConexion(pool)
        return (resultado.recordset[0].id)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar el reporte, verifique si se guardo en caso contrario intentelo nuevamente' }
    }
}

const crearReportePrev = async (data) => {

    try {

        const pool = await conectardb()

        const solicitud = await pool.query(`
            INSERT INTO solicitudes_mtto (id_activo, id_usuario, id_estado, fecha_solicitud, solicitud)
            VALUES('${data.id_activo}','${data.id_usuario}','${data.id_estado}','${data.fecha_solicitud}','${data.solicitud}')
            SELECT IDENT_CURRENT('solicitudes_mtto') AS id
        `)

        const idSolicitud = solicitud.recordset[0].id

        let resultado
        if (data.id_estado == 3) {
            resultado = await pool.query(`
                INSERT INTO repotesMtto (solicitud_id, tipoMtoo_id, fechareporte, costo_mo, costo_mp, proveedor_id, usuario_idReporte, usuario_idaprovado, hallazgos, reporte, recomendaciones, id_activo, fechaCreacion, fechaCierre, proximoMtto )
                    VALUES ('${idSolicitud}', '${data.tipoMantenimientoId}', '${data.fechaReporte}', '${data.costoMo}', '${data.costoMp}', '${data.provedorMttoId}', '${data.usuario_idReporte}', '${data.recibidoConformeId}', '${data.hallazgos}', '${data.reporte}', '${data.recomendaciones}', '${data.id_activo}', '${data.fechaCreacion}', '${data.fechaCierre}', '${data.fechaproximoMtto}')
                SELECT IDENT_CURRENT('repotesMtto') AS id
            `)
        } else {
            resultado = await pool.query(`
                INSERT INTO repotesMtto (solicitud_id, tipoMtoo_id, fechareporte, costo_mo, costo_mp, proveedor_id, usuario_idReporte, usuario_idaprovado, hallazgos, reporte, recomendaciones, id_activo, fechaCreacion, proximoMtto)
                    VALUES ('${idSolicitud}', '${data.tipoMantenimientoId}', '${data.fechaReporte}', '${data.costoMo}', '${data.costoMp}', '${data.provedorMttoId}', '${data.usuario_idReporte}', '${data.recibidoConformeId}', '${data.hallazgos}', '${data.reporte}', '${data.recomendaciones}', '${data.id_activo}', '${data.fechaCreacion}', '${data.fechaproximoMtto}')
                SELECT IDENT_CURRENT('repotesMtto') AS id
            `)
        }


        const actualizarEstadoActivo = await pool.query(`
            UPDATE listado_activos
            SET fecha_proximo_mtto = '${data.fechaproximoMtto}', estado_id = '${data.estadoActivoId}'
            WHERE id = '${data.id_activo}' 
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
                SET costo_mo = '${data.costoMo}', costo_mp = '${data.costoMp}', fechareporte = '${data.fechaReporte}',
                    proximoMtto = '${data.fechaproximoMtto}', hallazgos = '${data.hallazgos}', proveedor_id = '${data.provedorMttoId}',
                    usuario_idaprovado = '${data.recibidoConformeId}', recomendaciones = '${data.recomendaciones}', reporte = '${data.reporte}',
                    tipoMtoo_id = '${data.tipoMantenimientoId}', usuario_idReporte = '${data.usuario_idReporte}', fechaCierre = '${data.fechaCierre}'
                WHERE id = '${data.idReporte}'
                
                UPDATE solicitudes_mtto 
                    SET id_estado = '${data.estadoSolicitudId}'
                WHERE id = '${data.idSolicitud}'
                
                UPDATE listado_activos
                    SET fecha_proximo_mtto = '${data.fechaproximoMtto}', estado_id = '${data.estadoActivoId}'
                WHERE id = '${data.idActivo}'             
            `)
        } else {
            resultado = await pool.query(`
                UPDATE repotesMtto
                SET costo_mo = '${data.costoMo}', costo_mp = '${data.costoMp}', fechareporte = '${data.fechaReporte}',
                    proximoMtto = '${data.fechaproximoMtto}', hallazgos = '${data.hallazgos}', proveedor_id = '${data.provedorMttoId}',
                    usuario_idaprovado = '${data.recibidoConformeId}', recomendaciones = '${data.recomendaciones}', reporte = '${data.reporte}',
                    tipoMtoo_id = '${data.tipoMantenimientoId}', usuario_idReporte = '${data.usuario_idReporte}'
                WHERE id = '${data.idReporte}'
                
                UPDATE solicitudes_mtto 
                    SET id_estado = '${data.estadoSolicitudId}'
                WHERE id = '${data.idSolicitud}'
                
                UPDATE listado_activos
                    SET fecha_proximo_mtto = '${data.fechaproximoMtto}', estado_id = '${data.estadoActivoId}'
                WHERE id = '${data.idActivo}'        
            `)

        }
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar el reporte, verifique si se guardo en caso contrario intentelo nuevamente' }
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

const actualizarSoporteReporte = async (data) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE repotesMtto
                SET repIntExte='${data.repIntExte}'
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


const eliminarReporteBd = async (idReporte, idSolicitud) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            DELETE FROM repotesMtto 
            WHERE id ='${idReporte}'

            UPDATE solicitudes_mtto
                SET id_estado = 1
            WHERE id = '${idSolicitud}' 
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar el activo' }
    }
}

export {
    consultarReportes,
    consultarReporteUno,
    guardarReporte,
    actualizarReporte,
    consultarReportesActivo,
    dataConfReporte,
    actualizarImagenesReporte,
    actualizarSoporteReporte,
    consultarReportevalidacion,
    eliminarReporteBd,
    crearReportePrev
}