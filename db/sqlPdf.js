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
const dataSolicitud = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT  TRIM(LA.nombre) AS nombre, CONCAT(TRIM(CA.siglas), TRIM(LA.consecutivo_interno)) AS codigo, TRIM(MA.marca) AS marca,
                TRIM(LA.modelo) AS modelo, TRIM(LA.serie) AS serie, LA.tipo_activo_id, TRIM(LA.ubicacion) AS ubicacion,
                CONCAT(TRIM(USA.nombre),' ', TRIM(USA.nombre_1),' ', TRIM(USA.apellido),' ', TRIM(USA.apellido_1)) AS responsable,
                CONCAT(TRIM(USS.nombre),' ', TRIM(USS.nombre_1),' ', TRIM(USS.apellido),' ', TRIM(USS.apellido_1)) AS usuarioSolicitud,
                TRIM(ES.estado) AS estado, TRIM(FR.frecuencia) AS frecuencia, TRIM(PR.proceso) AS proceso, TRIM(AR.area) AS area,
                TRIM(PRO.razon_social) AS proveedor, SO.id AS idSolicitud, SO.fecha_solicitud AS fechaSolicitud, SO.solicitud AS solicitud,
                SO.img_solicitud AS imgSolicitud, LA.url_img, TRIM(CA.siglas) as siglas
                FROM solicitudes_mtto SO
                INNER JOIN listado_activos LA
                ON LA.id = SO.id_activo
                INNER JOIN clasificacion_activos CA
                ON CA.id = LA.clasificacion_id
                INNER JOIN marca_activos MA
                ON MA.id = la.marca_id
                INNER JOIN usuarios USA
                ON USA.id = LA.usuario_id
                INNER JOIN usuarios USS
                ON USS.id = SO.id_usuario
                INNER JOIN estados ES
                ON ES.id = LA.estado_id
                INNER JOIN frecuencia_Mtto FR
                ON FR.id = la.frecuencia_id
                INNER JOIN procesos PR
                ON PR.id = LA.proceso_id
                INNER JOIN areas AR
                ON AR.id = LA.area_id
                INNER JOIN proveedores PRO
                ON PRO.id =LA.proveedor_id
            WHERE SO.id = '${id}'

        `)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar cargar los datos del solicitud' }
    }
}

const dataActivo = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT  LA.id, LA.nombre, CONCAT(TRIM(CA.siglas), TRIM(LA.consecutivo_interno)) AS codigo, TRIM(MA.marca) AS marca, LA.modelo,
                LA.serie, LA.riesgo, LA.fecha_compra AS fechaCompra , LA.vencimiento_garantia AS garantia, LA.tipo_activo_id, 
                TRIM(LA.ubicacion) AS ubicacion, 
                CONCAT(TRIM(USR.nombre), ' ', TRIM(USR.nombre_1), ' ', TRIM(USR.apellido), ' ', TRIM(USR.apellido) ) AS responsable,
                TRIM(ES.estado) AS estado, TRIM(FR.frecuencia) AS frecuencia, TRIM(PR.proceso) AS proceso, TRIM(AR.area) AS area,
                TRIM(PRO.razon_social) AS proveedor, TRIM(LA.numero_factura) AS factura, TRIM(LA.valor) AS valor, la.fecha_creacion AS ingreso,
                TRIM(LA.descripcion) AS descripcion, TRIM(LA.recomendaciones_Mtto) AS recomendaciones, TRIM(LA.obervacion) AS observacion,
                LA.url_img, TRIM(CA.siglas) AS siglas
                FROM listado_activos LA
                INNER JOIN clasificacion_activos CA
                ON CA.id = LA.clasificacion_id
                INNER JOIN marca_activos MA
                ON MA.id = LA.marca_id
                INNER JOIN usuarios USR
                ON USR.id = LA.usuario_id
                INNER JOIN estados ES
                ON ES.id = LA.estado_id
                INNER JOIN frecuencia_Mtto FR
                ON FR.id = LA.frecuencia_id
                INNER JOIN procesos PR
                ON PR.id = LA.proceso_id
                INNER JOIN areas AR
                ON AR.id = LA.area_id
                INNER JOIN proveedores PRO
                ON PRO.id = LA.proveedor_id
            
            WHERE LA.id = '${id}'
        
            SELECT TRIM(LC.componente) AS nombre, TRIM(ma.marca) AS marca, TRIM(CO.modelo) AS modelo, TRIM(CO.serie) AS serie, TRIM(CO.capacidad) AS capacidad
                FROM componentes_activos CO
                INNER JOIN lista_componentes LC
                ON LC.id = CO.componenteId
                INNER JOIN marca_activos MA
                ON MA.id = CO.marca
            WHERE CO.idactivo = '${id}'

        `)
        return (resultado.recordsets)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar cargar los datos del activo' }
    }
}

const dataListaReporte = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT TRIM(LA.nombre) AS nombre, CONCAT(TRIM(CA.siglas), TRIM(LA.consecutivo_interno)) AS codigo, RM.id, RM.fechareporte AS fechaReporte,
                TRIM(RM.hallazgos) AS hallazgos, TRIM(RM.reporte) AS reporte, TRIM(RM.recomendaciones) AS recomendaciones, RM.proximoMtto AS fechaProximo,
                TRIM(PRO.razon_social) AS proveedor
                FROM repotesMtto RM 
                INNER JOIN listado_activos LA
                ON LA.id = RM.id_activo
                INNER JOIN clasificacion_activos CA
                ON CA.id = LA.clasificacion_id
                INNER JOIN proveedores PRO
                ON PRO.id = RM.proveedor_id
                WHERE RM.id_activo = '${id}'
            ORDER BY RM.fechareporte DESC

        `)
        return (resultado.recordsets[0])   
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar cargar los datos del activo' }
    }
}


export {
    dataReporte,
    dataSolicitud,
    dataActivo,
    dataListaReporte
}