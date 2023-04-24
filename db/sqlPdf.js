import conectardb from "./db.js";
const dataReporte = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT LA.id AS idActivo, RE.id AS idReporte,SO.id AS idSolicitud, TRIM(LA.nombre) AS nombre,TRIM(CA.siglas) AS siglas,
                CONCAT(TRIM(CA.siglas),TRIM(LA.consecutivo_interno)) AS codigo, TRIM(MA.marca) AS marca, TRIM(LA.modelo) AS modelo,
                TRIM(LA.serie) AS serie, LA.tipo_activo_id, TRIM(LA.ubicacion) AS ubicacion,
                CONCAT(TRIM(US.nombre),' ', TRIM(US.nombre_1),' ', TRIM(US.apellido),' ', TRIM(US.apellido_1)) AS responsable,
                TRIM(ES.estado) AS estado, TRIM(FE.frecuencia) AS frecuencia, TRIM(PRO.proceso) AS proceso, TRIM(A.area) AS area,
                TRIM(PROA.razon_social) AS proveedor,TRIM(PROR.razon_social) AS proveedorReporte, SO.fecha_solicitud AS fechaSolicitud,
                RE.fechareporte AS fechaReporte, RE.fechaCierre, LA.fecha_proximo_mtto AS proximoMtto, RE.tipoMtoo_id, RE.costo_mo AS mo,
                RE.costo_mp AS mp, TRIM(SO.solicitud) AS solicitud, TRIM(RE.hallazgos) AS hallazgos, TRIM(RE.reporte) AS reporte,
                TRIM(RE.recomendaciones) AS recomendaciones, TRIM(USR.firma) AS firmaReporte, TRIM(USA.firma) AS frimaAprobado,
                CONCAT(TRIM(USR.nombre),' ', TRIM(USR.nombre_1),' ', TRIM(USR.apellido),' ', TRIM(USR.apellido_1)) AS usuarioReporte,
                CONCAT(TRIM(USA.nombre),' ', TRIM(USA.nombre_1),' ', TRIM(USA.apellido),' ', TRIM(USA.apellido_1)) AS usuarioAprobado,
                TRIM(ESS.estado) AS estadoSolicitud ,RE.img_reporte, LA.url_img
                FROM repotesMtto RE
                INNER JOIN listado_activos LA
                ON LA.id = RE.id_activo
                INNER JOIN clasificacion_activos CA
                ON CA.id = LA.clasificacion_id
                INNER JOIN marca_activos MA
                ON MA.id = LA.marca_id
                INNER JOIN usuarios US
                ON US.id = la.usuario_id
                INNER JOIN solicitudes_mtto SO
                ON SO.id = RE.solicitud_id
                INNER JOIN usuarios USR
                ON USR.id = RE.usuario_idReporte
                INNER JOIN usuarios USA
                ON USA.id = RE.usuario_idaprovado
                INNER JOIN estados ES
                ON ES.id = LA.estado_id
                INNER JOIN estado_solicitudes ESS
                ON ESS.id = SO.id_estado
                INNER JOIN frecuencia_Mtto FE
                ON FE.id = LA.frecuencia_id
                INNER JOIN procesos PRO
                ON PRO.id = LA.proceso_id
                INNER JOIN areas A
                ON A.id = LA.area_id
                INNER JOIN proveedores PROA
                ON PROA.id = LA.proveedor_id
                INNER JOIN proveedores PROR
                ON PROR.id = RE.proveedor_id

             WHERE  RE.id = '${id}'

        `)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar cargar los datos del reporte' }
    }
}

export {
    dataReporte,
}