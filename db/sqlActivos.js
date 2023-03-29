import conectardb from "./db.js";

const dataConfActivo = async () => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(
            `SELECT * FROM clasificacion_activos
            SELECT * FROM marca_activos
            SELECT * FROM procesos
            SELECT * FROM areas
            SELECT id, nombre_comercial, razon_social, nit, estado FROM proveedores
            SELECT * FROM tipo_activo
            SELECT * FROM estados
            SELECT id, nombre, nombre_1, apellido, apellido_1 FROM usuarios
            SELECT * FROM frecuencia_Mtto
            SELECT * FROM estado_solicitudes
            SELECT * FROM tipo_mantenimeintos`
        )
        return (resultado.recordsets)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar cargar los datos de configuracion'}
    }
}

const consultarActivos = async () => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`SELECT la.id,CONCAT(RTRIM(ca.siglas), la.consecutivo_interno) AS codigoInterno, la.nombre AS nombreActivo, ma.marca, la.modelo, la.serie, la.ubicacion, CONCAT(us.nombre, SPACE(1), us.nombre_1, SPACE(1), us.apellido, SPACE(1), us.apellido_1) AS nombreResponsable , es.estado
            FROM listado_activos la
        INNER JOIN clasificacion_activos ca
            on la.clasificacion_id =ca.id
        INNER JOIN marca_activos ma
            on la.marca_id = ma.id
        INNER JOIN usuarios us
            on la.usuario_id = us.id
        INNER JOIN estados es
            on la.estado_id = es.id
		ORDER BY estado_id ASC, nombreActivo ASC`)
        return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar guardar los datos intentalo mas tarde'}
    }
}

const gudardarNuevoActivo = async (data) => {

    try {
        const consecutivo = await pool.query(`SELECT TOP 1 consecutivo_interno FROM listado_activos WHERE clasificacion_id='${activo.clasificacion_id}' ORDER BY consecutivo_interno DESC`)

        const aumento = parseInt(consecutivo.recordset[0].consecutivo_interno) + 1
        activo.consecutivo_interno = aumento.toString().padStart(4, 0)
       
        const resultado = await pool.query(`INSERT INTO listado_activos (clasificacion_id, 
            consecutivo_interno,
            nombre,
            marca_id,
            modelo,
            serie,
            proceso_id,
            area_id,
            ubicacion,
            usuario_id,
            estado_id,
            proveedor_id,
            numero_factura,
            valor,
            fecha_compra,
            vencimiento_garantia,
            frecuencia_id,
            descripcion,
            recomendaciones_Mtto,
            obervacion,
            create_by,
            tipo_activo_id,
            fecha_creacion,
        )
        VALUES
        ('${data.clasificacion_id}','${data.consecutivo_interno}','${data.nombre}','${data.marca_id}','${data.modelo}','${data.serie}','${data.proceso_id}','${data.area_id}','${data.ubicacion}','${data.usuario_id}','${data.estado_id}','${data.proveedor_id}','${data.numero_factura}','${data.valor}','${data.fecha_compra}','${data.vencimiento_garantia}','${activo.frecuencia_id}','${activo.descripcion}','${data.recomendaciones_Mtto}','${data.obervacion}','${data.create_by}','${data.data}','${data.fecha_creacion}')
        
        SELECT IDENT_CURRENT('listado_activos') AS id`)

        const id = resultado.recordset[0].id

        const newActivo = await pool.query(`SELECT la.id, RTRIM(ca.siglas) AS siglas, CONCAT( RTRIM(ca. siglas), la.consecutivo_interno) AS codigo
                FROM listado_activos la
                INNER JOIN clasificacion_activos ca
                    on la.clasificacion_id =ca.id
                INNER JOIN estados es
                    on la.estado_id = es.id
                 WHERE la.id = '${id}'`)

        return (newActivo.recordset[0])
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar guardar los datos intentalo mas tarde'}
    }
}

const guardarImagenes = async (imagenes, id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`UPDATE listado_activos
        SET url_img ='${imagenes}'
        WHERE id = '${id}'`)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar guardar los datos intentalo mas tarde'}
    }
}

const actualizarActivo = async (data, id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`UPDATE listado_activos
        SET url_img ='${imagenes}'
        WHERE id = '${id}'`)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar guardar los datos intentalo mas tarde'}
    }
}

const consultarCodigoInterno = async (id) => {

    try {
        const pool = await conectardb()

        const resultado = await pool.query(`SELECT CONCAT( RTRIM(ca. siglas), la.consecutivo_interno) AS codigo
                FROM listado_activos la
                INNER JOIN clasificacion_activos ca
                    on la.clasificacion_id =ca.id
                 WHERE la.id = '${id}'`)

        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar consultar los datos intentalo mas tarde'}
    }
}



export{ 
    consultarActivos,
    dataConfActivo,
    gudardarNuevoActivo,
    guardarImagenes,
    consultarCodigoInterno
}