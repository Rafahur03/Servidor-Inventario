import { conectardb, cerrarConexion } from "./db.js";


const validarExisteUsuario = async (numero_id, email) => {
    try {
        const pool = await conectardb()
        const resultado = await pool.query(`SELECT id, estado FROM usuarios WHERE numero_id='${numero_id}'
        SELECT id, estado FROM usuarios WHERE email='${email}'`)
        cerrarConexion(pool)
        return resultado.recordsets
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error intentalo mas tarde' }
    }


}

const consultarPassword = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`SELECT password FROM usuarios WHERE id='${id}'`)
        cerrarConexion(pool)
        return resultado.recordset[0]
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error intentalo mas tarde' }
    }
}

const consultarDataUsuario = async (id) => {
    try {
        const pool = await conectardb()
        const resultado = await pool.query(`SELECT id, tipo_id, numero_id, nombre, nombre_1, apellido, apellido_1, email, Id_proveedores, permisos, estado  FROM usuarios WHERE id ='${id}'`)
        cerrarConexion(pool)
        return resultado.recordset[0]
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error intentalo mas tarde' }
    }
}

const guardarUsuario = async (data) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`INSERT INTO usuarios (tipo_id, numero_id, nombre, nombre_1, apellido, apellido_1, email, password, estado, createby, Id_proveedores, date_create, permisos, firma)
        VALUES('${data.tipoId}', '${data.numeroDocumento}', '${data.primerNombre}', '${data.segundoNombre}', '${data.primerApellido}', '${data.segundoApellido}', '${data.email}', '${data.password}', '1', '${data.createby}', '${data.Id_proveedores}','${data.date_create}', '${data.permisos}', '${data.pathFirma}')
        SELECT IDENT_CURRENT('usuarios') AS id`)
        cerrarConexion(pool)
        return resultado.recordset[0]
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar guardar los datos intentalo mas tarde' }
    }
}

const buscarUsuario = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT us.id, us.numero_id AS numeroDocumento, TRIM(us.tipo_id) AS tipoId, TRIM(us.nombre) AS primerNombre,
                TRIM(us.nombre_1) AS segundoNombre, TRIM(us.apellido) AS primerApellido,TRIM(us.apellido_1) AS segundoApellido,
                TRIM(us.email) AS email, us.estado AS estadoId, TRIM(es.estado) AS estado, TRIM(us.Id_proveedores) AS IdPporveedores, TRIM(us.permisos) AS permisos,
                TRIM(us.firma) AS firma
                FROM usuarios us
                INNER JOIN estados es
                ON es.id = us.estado
            WHERE us.id = ${id}
        `)
        cerrarConexion(pool)
        return resultado.recordset[0]
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar el usuario' }
    }
}

const consultarProveedoresUsuarios = async (consulta) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(consulta)
        cerrarConexion(pool)
        return resultado.recordsets
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los proveedores' }
    }
}

const actualizarUsuario = async (data) => {

    try {
        const pool = await conectardb()

        if (data.password) {
            const resultado = await pool.query(`UPDATE usuarios
                SET numero_id='${data.numero_id}', tipo_id ='${data.tipo_id}', nombre='${data.nombre}', nombre_1= '${data.nombre_1}', apellido='${data.apellido}', apellido_1='${data.apellido_1}', email='${data.email}',password='${data.password}', estado='${data.estado}', Id_proveedores='${data.Id_proveedores}',permisos='${data.permisos}'
                WHERE id='${data.id}'`)
            cerrarConexion(pool)
            return resultado.rowsAffected[0]
        }

        const resultado = await pool.query(`UPDATE usuarios
            SET numero_id= '${data.numero_id}', tipo_id ='${data.tipo_id}', nombre='${data.nombre}', nombre_1= '${data.nombre_1}', apellido='${data.apellido}', apellido_1='${data.apellido_1}', email='${data.email}', estado='${data.estado}', Id_proveedores='${data.Id_proveedores}', permisos='${data.permisos}'
            WHERE id='${data.id}'`)
        cerrarConexion(pool)
        return resultado.rowsAffected[0]
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar los datos intentalo mas tarde' }
    }
}

const guardarToken = async (token, id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE usuarios
                SET token='${token}'
            WHERE id='${id}'

            SELECT id, CONCAT(  nombre, SPACE(1), nombre_1, SPACE(1), apellido,  SPACE(1), apellido_1) as nombreUsuario, TRIM(Id_proveedores) AS proveedores, TRIM( permisos) AS permisos, estado  
                FROM usuarios
            WHERE id='${id}'    
        `)
        cerrarConexion(pool)
        return resultado.recordset[0]

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar los datos intentalo mas tarde' }
    }
}

const consultarToken = async (token) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT id, TRIM(permisos) AS permisos, TRIM(Id_proveedores) AS id_proveedores
                FROM usuarios
            WHERE token = '${token}'
        `)
        cerrarConexion(pool)
        return resultado.recordset[0]

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar los datos intentalo mas tarde' }
    }
}

export {
    validarExisteUsuario,
    consultarPassword,
    consultarDataUsuario,
    guardarUsuario,
    actualizarUsuario,
    guardarToken,
    consultarToken,
    buscarUsuario,
    consultarProveedoresUsuarios
}