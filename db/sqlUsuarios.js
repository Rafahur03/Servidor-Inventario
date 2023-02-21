import conectardb from "./db.js";


const validarExisteUsuario = async (numero_id, email) => {
    try {
        const pool = await conectardb()
        const resultado = await pool.query(`SELECT id, estado FROM usuarios WHERE numero_id='${numero_id}'
        SELECT id, estado FROM usuarios WHERE email='${email}'`)
        return resultado.recordsets
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error intentalo mas tarde'}
    }
}

const consultarPassword = async (id) => { 

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`SELECT password FROM usuarios WHERE id='${id}'`)
        return resultado.recordset[0]
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error intentalo mas tarde'}
    }
}

const consultarDataUsuario = async (id) => {
    try {
        const pool = await conectardb()
        const resultado = await pool.query(`SELECT id, tipo_id, numero_id, nombre, nombre_1, apellido, apellido_1, email, Id_proveedores FROM usuarios WHERE id ='${id}'`)
        return resultado.recordset[0]
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error intentalo mas tarde'}
    }
}

const guardarUsuario = async (data) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`INSERT INTO usuarios (tipo_id, numero_id, nombre, nombre_1, apellido, apellido_1, email, password, estado, createby, Id_proveedores)
        VALUES('${data.tipo_id}', '${data.numero_id}', '${data.nombre}', '${data.nombre_1}', '${data.apellido}', '${data.apellido_1}', '${data.email}', '${data.password}', '${data.estado}', '${data.createby}', '${data.Id_proveedores}')
        SELECT IDENT_CURRENT('usuarios') AS id`)
        return resultado.recordset
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar guardar los datos intentalo mas tarde'}
    }
}

export {
    validarExisteUsuario,
    consultarPassword,
    consultarDataUsuario
}