import { conectardb, cerrarConexion } from "./db.js";


const consultarListadoInsumosBodega = async () => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT CONCAT('Ins-',ib.id) as id, TRIM(ins.insumo) AS nombre,TRIM(ar.area) AS area,TRIM(ma.marca) AS marca, ib.modelo, ib.serie, ib.cantidad
            FROM insumoBodega  ib
            INNER JOIN insumos ins
            ON ins.id = ib.id
            INNER JOIN areas ar
            ON ar.id = ib.idArea
            INNER JOIN marca_activos ma
            ON ma.id = ib.marca
        WHERE cantidad > 0
    `)
        cerrarConexion(pool)
        return (resultado.recordset)

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar el likstado de insumos' }
    }
}

const consultarInsumosBodega = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT CONCAT('Ins-', ib.id) AS id, TRIM(ins.insumo) AS nombre,TRIM(ar.area) AS area,TRIM(ma.marca) AS marca, TRIM(ib.modelo) AS modelo,
			TRIM(ib.serie) AS serie, ib.proveedor AS idProveedor, ib.cantidad, ib.costo_Unitario,ib.idArea AS idArea, ib.marca AS idMArca,
			ib.fechaCompra, TRIM(ib.factura) AS factura, CONCAT(TRIM(pro.razon_social), ' -- ',TRIM(pro.nombre_comercial), ' -- ', TRIM(pro.nit)) AS provedor,
            TRIM(FacturaPdf) AS FacturaPdf, TRIM(imagen) AS imagen
	        FROM insumoBodega  ib
            INNER JOIN insumos ins
            ON ins.id = ib.id
            INNER JOIN areas ar
            ON ar.id = ib.idArea
            INNER JOIN marca_activos ma
            ON ma.id = ib.marca 
            INNER JOIN proveedores pro
            ON pro.id = ib.proveedor
        WHERE ib.id = ${id}

        SELECT mbi.id AS idMovimiento, mbi.fecha AS fechaMovimiento, mbi.cantidad AS cantidadMovimiento, TRIM(mi.tipo) AS tipoMovimiento,
            mbi.descripcionAqueo AS observacionMovimiento, CONCAT(TRIM(us.nombre),SPACE(1), TRIM(us.nombre_1), SPACE(1), TRIM(us.apellido), SPACE(1), TRIM(us.apellido_1)) AS usuarioDestino 
            FROM movimiento_Bodega_insumos mbi
            INNER JOIN movimientoInsumos mi
            ON mi.id = mbi.transaccion
            INNER JOIN usuarios us
            ON us.id = mbi.usuariodestino
        WHERE mbi.idInsumoBodega =${id}
        ORDER BY fechaMovimiento DESC

        SELECT us.id, CONCAT(TRIM(us.nombre),SPACE(1), TRIM(us.nombre_1), SPACE(1), TRIM(us.apellido), SPACE(1), TRIM(us.apellido_1)) AS nombre 
            FROM usuarios us
        WHERE estado !=3 
    `)
        cerrarConexion(pool)
        return (resultado.recordsets)

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los datos del insumo' }
    }
}

const consultarCantidadInsumo = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT  id, cantidad
	        FROM insumoBodega
        WHERE id = ${id}


    `)
        cerrarConexion(pool)
        return (resultado.recordset[0])

    } catch (error) {
        console.error(error);
        return { msg: 'No fue posible Validar el Insumo en la Base de datos' }
    }
}

const movimientoBodegaInsumos = async (data) => {
    const query = `
        DECLARE @idIdentCurrent INT;

        -- Actualiza la tabla 'insumoBodega'
        UPDATE insumoBodega 
            SET cantidad = ${data.cantidadNueva}
        WHERE id = ${data.idInsumoBodega};

        -- Inserta datos en la tabla 'movimiento_Bodega_insumos'
        INSERT INTO movimiento_Bodega_insumos(transaccion, cantidad, usuario, idInsumoBodega, usuariodestino, fecha, cantidadAnterior, descripcionAqueo)
        VALUES(${data.transaccion}, ${data.cantidad}, ${data.usuario}, ${data.idInsumoBodega}, ${data.usuariodestino}, '${data.fecha}', ${data.cantidadAnterior},'${data.descripcionAqueo}');

        -- Obtiene el último ID insertado
        SET @idIdentCurrent = IDENT_CURRENT('movimiento_Bodega_insumos');

        -- Selecciona los datos requeridos utilizando el ID obtenido
        SELECT mbi.id AS idMovimiento, 
            mbi.fecha AS fechaMovimiento, 
            mbi.cantidad AS cantidadMovimiento, 
            TRIM(mi.tipo) AS tipoMovimiento,
            mbi.descripcionAqueo AS observacionMovimiento, 
            CONCAT(TRIM(us.nombre),SPACE(1), TRIM(us.nombre_1), SPACE(1), TRIM(us.apellido), SPACE(1), TRIM(us.apellido_1)) AS usuarioDestino 
        FROM movimiento_Bodega_insumos mbi
        INNER JOIN movimientoInsumos mi ON mi.id = mbi.transaccion
        INNER JOIN usuarios us ON us.id = mbi.usuariodestino
        WHERE mbi.id = @idIdentCurrent;


    `
    console.log(query)
    try {
        const pool = await conectardb()
        const resultado = await pool.query(query)
        cerrarConexion(pool)
        return (resultado.recordset[0])


    } catch (error) {
        console.error(error);
        return { msg: 'No fue posible realizar el movimiento en la base de datos' }
    }
}

const datosValidarInsumo = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT id AS id, TRIM(modelo) AS modelo,TRIM(serie) AS serie, costo_Unitario, fechaCompra, 
		    TRIM(factura) AS factura, idArea, marca, proveedor, TRIM(FacturaPdf) AS FacturaPdf,
            TRIM(imagen) AS imagen
		    FROM insumoBodega 
        WHERE id = ${id}

    `)
        cerrarConexion(pool)
        return (resultado.recordset[0])

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los datos del insumo' }
    }
}

const actualizarInsumoBd = async (set, id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        UPDATE insumoBodega
            SET ${set.toString()}
        WHERE id = ${id}

    `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar los datos del insumo' }
    }
}

const actualizarImagenInsumo = async (id, imagen) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        UPDATE insumoBodega
            SET imagen = '${imagen}'
        WHERE id = ${id}

    `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar los datos del insumo' }
    }
}

const actualizarFacturaInsumo = async (id, factura) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        UPDATE insumoBodega
            SET FacturaPdf = '${factura}'
        WHERE id = ${id}

    `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar los datos del insumo' }
    }
}
export {
    consultarListadoInsumosBodega,
    consultarInsumosBodega,
    consultarCantidadInsumo,
    movimientoBodegaInsumos,
    datosValidarInsumo,
    actualizarInsumoBd,
    actualizarImagenInsumo,
    actualizarFacturaInsumo
}