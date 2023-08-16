import { conectardb, cerrarConexion } from "./db.js";

const dataConfActivo = async () => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT id, TRIM(siglas) AS siglas, TRIM(nombre) AS nombre FROM clasificacion_activos WHERE estado != 3
            SELECT id, TRIM(marca) AS marca FROM marca_activos WHERE estado !=3
            SELECT id, TRIM(proceso) AS proceso, TRIM(sigla) AS sigla FROM procesos WHERE estado !=3
            SELECT id, TRIM(area) AS area FROM areas WHERE estado !=3
            SELECT id, TRIM(nombre_comercial) AS nombre_comercial, TRIM(razon_social) AS razon_social, TRIM(nit) AS nit FROM proveedores WHERE estado !=3
            SELECT id, TRIM(tipo_activo) AS tipoActivo FROM tipo_activo WHERE estado !=3
            SELECT id, TRIM(estado) AS estado FROM estados
            SELECT id, CONCAT(TRIM(nombre),SPACE(1), TRIM(nombre_1),SPACE(1), TRIM(apellido), SPACE(1), TRIM(apellido_1)) AS nombre FROM usuarios WHERE estado !=3
            SELECT id, TRIM(frecuencia) AS frecuencia, dias FROM frecuencia_Mtto WHERE estado !=3
            SELECT id, TRIM(estado) AS estado FROM estado_solicitudes
            SELECT id, TRIM(tipoMtto) AS tipoMtto FROM tipo_mantenimeintos WHERE estado_id !=3

        `)
        cerrarConexion(pool)
        return (resultado.recordsets)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar cargar los datos de configuracion' }
    }
}

const consultarActivos = async () => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT la.id, CONCAT(RTRIM(ca.siglas), la.consecutivo_interno) AS codigoInterno,
                TRIM(la.nombre) AS nombreActivo, TRIM(ma.marca) AS marca, TRIM(la.modelo) AS modelo,
                TRIM(la.serie) AS serie, TRIM(la.ubicacion) AS ubicacion, CONCAT(us.nombre, SPACE(1),
                us.nombre_1, SPACE(1), us.apellido, SPACE(1), us.apellido_1) AS nombreResponsable,
                TRIM(es.estado) as estado
                    FROM listado_activos la
                INNER JOIN clasificacion_activos ca
                    on la.clasificacion_id =ca.id
                INNER JOIN marca_activos ma
                    on la.marca_id = ma.id
                INNER JOIN usuarios us
                    on la.usuario_id = us.id
                INNER JOIN estados es
                    on la.estado_id = es.id
                WHERE la.estado_id <> '3'
            ORDER BY estado_id ASC, nombreActivo ASC
        `)
        cerrarConexion(pool)
        return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar los datos intentalo mas tarde' }
    }
}

const consultarActivoUno = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT  la.id, CONCAT(TRIM(ca.siglas),la.consecutivo_interno) AS codigo, TRIM(ca.siglas) AS siglas, TRIM(la.nombre) AS nombre,
                la.marca_id, TRIM(ma.marca) AS marca, TRIM(la.modelo) AS modelo, TRIM(la.serie) AS serie, la.proceso_id,
                TRIM(pr.proceso) AS proceso,la.area_id, TRIM(ar.area) AS area, TRIM(la.ubicacion) AS ubicacion,
                la.usuario_id AS responsableId, CONCAT(TRIM(us.nombre), SPACE(1), TRIM(us.nombre_1),SPACE(1), TRIM(us.apellido),SPACE(1),
                TRIM(us.apellido_1)) AS responsable, la.estado_id,TRIM(es.estado) AS estado, la.proveedor_id,
                TRIM(pro.nombre_comercial) AS provedor, TRIM(pro.nit) AS nit, TRIM(la.numero_factura) AS numero_factura,
                TRIM(la.valor) valor, la.fecha_compra, la.vencimiento_garantia, la.frecuencia_id, TRIM(fre.frecuencia) AS frecuencia,
                TRIM(la.descripcion) AS descripcion, TRIM(la.recomendaciones_Mtto) AS recomendaciones_Mtto,
                TRIM(la.obervacion) AS obervacion, TRIM(la.url_img) AS url_img, la.fecha_creacion, la.tipo_activo_id,
                TRIM(ta.tipo_activo) AS  tipoActivo, la.fecha_proximo_mtto, TRIM(la.soportes) AS soportes
                FROM listado_activos la
                INNER JOIN clasificacion_activos ca
                ON ca.id = la.clasificacion_id
                INNER JOIN marca_activos ma
                ON ma.id = la.marca_id
                INNER JOIN procesos pr
                ON pr.id = la.proceso_id
                INNER JOIN areas ar
                ON ar.id = la.area_id
                INNER JOIN estados es
                ON es.id = la.estado_id
                INNER JOIN usuarios us
                ON us.id = la.usuario_id
                INNER JOIN proveedores pro
                ON pro.id = la.proveedor_id
                INNER JOIN frecuencia_Mtto fre
                ON fre.id = la.frecuencia_id
                INNER JOIN tipo_activo ta
                ON ta.id = la.tipo_activo_id
            WHERE la.id ='${id}'
        `)
        cerrarConexion(pool)
        return (resultado.recordset[0])

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los dato' }
    }
}

const consultarActivoSolicitud = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT  la.id, CONCAT(TRIM(ca.siglas),la.consecutivo_interno) AS codigo, TRIM(la.nombre) AS nombre, TRIM(ma.marca) AS marca, TRIM(la.modelo) AS modelo, TRIM(la.serie) AS serie, TRIM(ar.area) AS area, TRIM(la.ubicacion) AS ubicacion, CONCAT(TRIM(us.nombre), SPACE(1), TRIM(us.nombre_1),SPACE(1), TRIM(us.apellido),SPACE(1), TRIM(us.apellido_1)) AS responsable, TRIM(es.estado) AS estado, la.url_img, TRIM(pr.proceso) AS proceso
                FROM listado_activos la
                INNER JOIN clasificacion_activos ca
                ON ca.id = la.clasificacion_id
                INNER JOIN marca_activos ma
                ON ma.id = la.marca_id
                INNER JOIN areas ar
                ON ar.id = la.area_id
                INNER JOIN estados es
                ON es.id = la.estado_id
                INNER JOIN usuarios us
                ON us.id = la.usuario_id
                INNER JOIN tipo_activo ta
                ON ta.id = la.tipo_activo_id
                INNER JOIN procesos pr
                ON pr.id = la.proceso_id
            WHERE la.id ='${id}'
        `)
        cerrarConexion(pool)
        return (resultado.recordset[0])

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los dato' }
    }
}

const guardarNuevoActivo = async (data) => {
    const pool = await conectardb()



    try {
        const consecutivo = await pool.query(
            `SELECT TOP 1 consecutivo_interno 
                FROM listado_activos 
                WHERE clasificacion_id='${data.clasificacion_id}' 
            ORDER BY consecutivo_interno DESC
        `)

        const aumento = parseInt(consecutivo.recordset[0].consecutivo_interno) + 1
        data.consecutivo_interno = aumento.toString().padStart(4, 0)
   
        const resultado = await pool.query(`
            INSERT INTO listado_activos (clasificacion_id, 
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
                fecha_creacion)
                VALUES('${data.clasificacion_id}','${data.consecutivo_interno}','${data.nombre}','${data.marca_id}','${data.modelo}','${data.serie}','${data.proceso_id}','${data.area_id}','${data.ubicacion}','${data.usuario_id}','${data.estado_id}','${data.proveedor_id}','${data.numero_factura}','${data.valor}','${data.fecha_compra}','${data.vencimiento_garantia}','${data.frecuencia_id}','${data.descripcion}','${data.recomendaciones_Mtto}','${data.obervacion}','${data.create_by}','${data.tipo_activo_id}','${data.fecha_creacion}')
        
            SELECT IDENT_CURRENT('listado_activos') AS id
        `)
        const id = resultado.recordset[0].id
      
        const newActivo = await pool.query(`
            SELECT la.id, RTRIM(ca.siglas) AS siglas, CONCAT( RTRIM(ca. siglas), la.consecutivo_interno) AS codigo
                FROM listado_activos la
                INNER JOIN clasificacion_activos ca
                    on la.clasificacion_id =ca.id
                INNER JOIN estados es
                    on la.estado_id = es.id
            WHERE la.id = '${id}'
        `)
        cerrarConexion(pool)
        return (newActivo.recordset[0])
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar crear los datos  del activo intentalo mas tarde' }
    }
}

const guardarImagenes = async (imagenes, id) => {
    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE listado_activos
                SET url_img ='${imagenes}'
            WHERE id = '${id}'
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar los datos de las imagenes' }
    }
}

const guardarSoportes = async (soportes, id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE listado_activos
                SET soportes ='${soportes}'
            WHERE id = '${id}'
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar los soportes en la bd' }
    }
}

const actualizarActivoDb = async (data) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE listado_activos
                SET nombre ='${data.nombre}',
                marca_id ='${data.marca_id}',
                modelo ='${data.modelo}',
                serie ='${data.serie}',
                proceso_id ='${data.proceso_id}',
                area_id ='${data.area_id}',
                ubicacion ='${data.ubicacion}',
                usuario_id ='${data.usuario_id}',
                estado_id ='${data.estado_id}',
                proveedor_id ='${data.proveedor_id}',
                numero_factura ='${data.numero_factura}',
                valor ='${data.valor}',
                fecha_compra ='${data.fecha_compra}',
                vencimiento_garantia ='${data.vencimiento_garantia}',
                frecuencia_id ='${data.frecuencia_id}',
                descripcion ='${data.descripcion}',
                recomendaciones_Mtto ='${data.recomendaciones_Mtto}',
                obervacion ='${data.obervacion}',
                tipo_activo_id ='${data.tipo_activo_id}',
                fecha_proximo_mtto = '${data.proximoMtto}'

            WHERE id='${data.id}'
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar los datos intentalo mas tarde' }
    }
}

const consultarCodigoInterno = async (id) => {

    try {
        const pool = await conectardb()

        const resultado = await pool.query(`
            SELECT CONCAT( RTRIM(ca. siglas), la.consecutivo_interno) AS codigo, la.url_img, RTRIM(ca.siglas) AS siglas, la.soportes, la.reportes, la.estado_id
                FROM listado_activos la
                INNER JOIN clasificacion_activos ca
                    on la.clasificacion_id =ca.id
            WHERE la.id = '${id}'
        `)
        cerrarConexion(pool)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los datos intentalo mas tarde' }
    }
}

const consultarCalsificacionActivoMod = async (idactivo, idclasificacion) => {

    try {
        const pool = await conectardb()

        const resultado = await pool.query(`
            SELECT la.clasificacion_id AS clasificacionActual, TRIM(ca.siglas) AS siglaActual, CONCAT(TRIM(ca.siglas), la.consecutivo_interno) as codigoActual
                FROM listado_activos la
                INNER JOIN clasificacion_activos ca
                ON la.clasificacion_id = ca.id
            WHERE la.id = '${idactivo}'

            SELECT id  AS existe, TRIM(siglas) as siglasNueva
                FROM clasificacion_activos
            WHERE id = '${idclasificacion}'
            
            SELECT TOP 1 consecutivo_interno
                FROM listado_activos 
                WHERE clasificacion_id = '${idclasificacion}' 
            ORDER BY consecutivo_interno DESC
        `)
        cerrarConexion(pool)
        return (resultado.recordsets)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los datos intentalo mas tarde' }
    }
}

const actualizarClasificacion = async (idactivo, idclasificacion, consecutivo_interno) => {

    try {
        const pool = await conectardb()

        const resultado = await pool.query(`
            UPDATE listado_activos
                SET clasificacion_id = '${idclasificacion}', consecutivo_interno = '${consecutivo_interno}'
            WHERE id= '${idactivo}'
        `)
        cerrarConexion(pool)
        return (resultado.recordsets)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los datos intentalo mas tarde' }
    }
}

const eliminarActivoDb = async (data) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE listado_activos
                SET estado_id ='3',
                eliminacion_cambio ='${data.motivo}'
            WHERE id='${data.id}'
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar el activo' }
    }
}

const actualizarComponentes = async (componentes, id) => {

    let quereyComponentes = `UPDATE componentes_activos
	    SET componenteId ='${componentes[0].componenteId}', marca = '${componentes[0].marcaId}', modelo= '${componentes[0].modelo}', serie = '${componentes[0].serie}', capacidad='${componentes[0].capacidad}', estado= '${componentes[0].estadoId}'
    WHERE id = '${componentes[0].id}'`


    componentes.forEach((element, index) => {
        if (index !== 0) {
            quereyComponentes += `\n UPDATE componentes_activos
                SET componenteId ='${element.componenteId}', marca = '${element.marcaId}', modelo= '${element.modelo}', serie = '${element.serie}', capacidad='${element.capacidad}', estado= '${element.estadoId}'
            WHERE id = '${element.id}'`
        }
    });

    const query = `${quereyComponentes} \n SELECT ca.id, ca.componenteId, TRIM(lp.componente) AS nombre, ca.marca AS marcaId, TRIM(ca.modelo) AS modelo, TRIM(ca.serie) AS serie,TRIM(ca.capacidad) AS capacidad, ca.estado as estadoId
        FROM componentes_activos ca
        INNER JOIN lista_componentes lp
        ON lp.id = ca.componenteId
    WHERE ca.idactivo = '${id}' AND  ca.estado = '1'`

    try {
        const pool = await conectardb()
        const resultado = await pool.query(query)
        cerrarConexion(pool)
        return (resultado.recordsets[0])
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar crear los componentes' }
    }
}

const actualizarSoportes = async (soportes, id) => {

    const query = `
        UPDATE listado_activos 
            SET soportes = '${soportes}'
        WHERE id = ${id}
    `
    try {
        const pool = await conectardb()
        const resultado = await pool.query(query)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar lo soportes' }
    }
}




export {
    consultarActivos,
    dataConfActivo,
    guardarNuevoActivo,
    guardarImagenes,
    consultarCodigoInterno,
    actualizarActivoDb,
    consultarCalsificacionActivoMod,
    actualizarClasificacion,
    eliminarActivoDb,
    consultarActivoUno,
    guardarSoportes,
    actualizarComponentes,
    actualizarSoportes,
    consultarActivoSolicitud
}