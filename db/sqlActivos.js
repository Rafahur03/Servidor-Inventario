import conectardb from "./db.js";

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

export{ 
    consultarActivos
}