import conectardb from "./db.js";

const consultarReportes = async () => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT * FROM repotesMtto
            ORDER BY id ASC
        `)
        return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar guardar los datos intentalo mas tarde'}
    }
}

const consultarReporteUno = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT * FROM repotesMtto
            WHERE id ='${id}'
        `)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar consultar los dato'}
    }
}

const guardarReporte = async (data) => {
    
    try {

        const pool = await conectardb()
        let resultado
        if(data.id_estado = 3){
            resultado = await pool.query(`
                INSERT INTO repotesMtto (solicitud_id, tipoMtoo_id, fechareporte, costo_mo, costo_mp, proveedor_id, usuario_idReporte, usuario_idaprovado, hallazgos, reporte, recomendaciones, id_activo, img_reporte, reportes, fechaCreacion, fechaCierre)
                    VALUES ('${data.solicitud_id}', '${data.tipoMtoo_id}', '${data.fechareporte}', '${data.costo_mo}', '${data.costo_mp}', '${data.proveedor_id}', '${data.usuario_idReporte}', '${data.usuario_idaprovado}', '${data.hallazgos}', '${data.reporte}', '${data.recomendaciones}', '${data.id_activo}', '${data.img_reporte}', '${data.reportes}', '${data.fechaCreacion}' , '${data.fechaCreacion}')
                SELECT IDENT_CURRENT('repotesMtto') AS id
            `)
        }else{
            resultado = await pool.query(`
                INSERT INTO repotesMtto (solicitud_id, tipoMtoo_id, fechareporte, costo_mo, costo_mp, proveedor_id, usuario_idReporte, usuario_idaprovado, hallazgos, reporte, recomendaciones, id_activo, img_reporte, reportes, fechaCreacion)
                    VALUES ('${data.solicitud_id}', '${data.tipoMtoo_id}', '${data.fechareporte}', '${data.costo_mo}', '${data.costo_mp}', '${data.proveedor_id}', '${data.usuario_idReporte}', '${data.usuario_idaprovado}', '${data.hallazgos}', '${data.reporte}', '${data.recomendaciones}', '${data.id_activo}', '${data.img_reporte}', '${data.reportes}', '${data.fechaCreacion}')
                SELECT IDENT_CURRENT('repotesMtto') AS id
            `)
        }
        

        const actualziarEstadoSolicitud = await pool.query(`
            UPDATE solicitudes_mtto
                SET id_estado = '${data.id_estado}'
            WHERE id = '${data.solicitud_id}'
        `)

         return (resultado.recordset[0].id)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar guardar el reporte, verifique si se guardo en caso contrario intentelo nuevamente'}
    }
}

const actualizarReporte = async (data) => {
    
    try {

        const pool = await conectardb()
        let resultado
        if(data.id_estado === 3){
            resultado = await pool.query(`
            UPDATE repotesMtto
                SET tipoMtoo_id = '${data.tipoMtoo_id}' , fechareporte = '${data.fechareporte}', costo_mo = '${data.costo_mo}', costo_mp = '${data.costo_mp}', proveedor_id = '${data.proveedor_id}', usuario_idaprovado = '${data.usuario_idaprovado}', hallazgos = '${data.hallazgos}', reporte = '${data.reporte}', recomendaciones = '${data.recomendaciones}', img_reporte = '${data.img_reporte}', fechaCierre = '${data.fechaCierre}'
             WHERE id =  '${data.id}'            
        `)
        }else{
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

         return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar guardar el reporte, verifique si se guardo en caso contrario intentelo nuevamente'}
    }
}


export{consultarReportes,
    consultarReporteUno,
    guardarReporte,
    actualizarReporte
}