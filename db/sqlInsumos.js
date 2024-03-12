import { conectardb, cerrarConexion } from "./db.js";

const consultarlistasInsumo = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT id, TRIM(insumo) AS insumo FROM insumos WHERE estado = 1
            SELECT id, TRIM(bodega) AS bodega FROM bodegas WHERE estado = 1
            SELECT id, TRIM(marca) AS marca FROM marca_activos WHERE estado = 1
            SELECT id, CONCAT(TRIM(razon_social), '--', TRIM(nombre_comercial),  '--', TRIM(nit)) AS proveedor FROM proveedores WHERE estado = 1
         `)
        cerrarConexion(pool)
        return (resultado.recordsets)

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los datos del insumo' }
    }
}

const consultarListadoInsumosBodega = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT CONCAT('Ins-',ib.id) as id, TRIM(ins.insumo) AS nombre,TRIM(bo.bodega) AS bodega,TRIM(ma.marca) AS marca, ib.modelo, ib.serie, ib.cantidad
            FROM insumoBodega  ib
            INNER JOIN insumos ins
            ON ins.id =ib.idInsumo
            INNER JOIN bodegas bo
            ON bo.id = ib.idBodega
            INNER JOIN marca_activos ma
            ON ma.id = ib.marca
        WHERE  ib.cantidad > 0 AND ib.idBodega = ${id}
    `)
        cerrarConexion(pool)
        return (resultado.recordset)

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar el listado de insumos' }
    }
}

const consultarInsumosBodega = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT CONCAT('Ins-', ib.id) AS id, TRIM(ins.insumo) AS nombre,TRIM(bo.bodega) AS bodega,TRIM(ma.marca) AS marca, TRIM(ib.modelo) AS modelo,
			TRIM(ib.serie) AS serie, ib.proveedor AS idProveedor, ib.cantidad, ib.costo_Unitario, ib.marca AS idMArca,
			ib.fechaCompra, TRIM(ib.factura) AS factura, CONCAT(TRIM(pro.razon_social), ' -- ',TRIM(pro.nombre_comercial), ' -- ', TRIM(pro.nit)) AS provedor,
            TRIM(FacturaPdf) AS FacturaPdf, TRIM(imagen) AS imagen
	        FROM insumoBodega  ib
            INNER JOIN insumos ins
            ON ins.id = ib.idInsumo
            INNER JOIN bodegas bo
            ON bo.id = ib.idBodega
            INNER JOIN marca_activos ma
            ON ma.id = ib.marca 
            INNER JOIN proveedores pro
            ON pro.id = ib.proveedor
        WHERE ib.id = ${id}

        SELECT mbi.id AS idMovimiento, mbi.fecha AS fechaMovimiento, mbi.cantidad AS cantidadMovimiento, TRIM(mi.tipo) AS tipoMovimiento,
            mbi.descripcionAqueo AS observacionMovimiento, TRIM(bo.bodega) AS bodegaDestino,
			CONCAT(TRIM(us.nombre),SPACE(1), TRIM(us.nombre_1), SPACE(1), TRIM(us.apellido), SPACE(1), TRIM(us.apellido_1)) AS usuarioDestino,
			CONCAT(TRIM(usr.nombre),SPACE(1), TRIM(usr.nombre_1), SPACE(1), TRIM(usr.apellido), SPACE(1), TRIM(usr.apellido_1)) AS usuarioResponsable
            FROM movimiento_Bodega_insumos mbi
            INNER JOIN movimientoInsumos mi
            ON mi.id = mbi.transaccion
			INNER JOIN bodegas bo
            ON bo.id = mbi.bodegaDestino
			INNER JOIN usuarios usr
            ON usr.id = mbi.usuario
            INNER JOIN usuarios us
            ON us.id = mbi.usuariodestino
        WHERE mbi.idInsumoBodega =${id}
        ORDER BY fechaMovimiento DESC

        SELECT us.id, CONCAT(TRIM(us.nombre),SPACE(1), TRIM(us.nombre_1), SPACE(1), TRIM(us.apellido), SPACE(1), TRIM(us.apellido_1)) AS nombre 
            FROM usuarios us
        WHERE estado != 3 

        SELECT id, TRIM(bodega) AS bodega 
	        FROM bodegas
        WHERE estado = 1
    `)
        cerrarConexion(pool)
        return (resultado.recordsets)

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los datos del insumo' }
    }
}

const guardarInsumo = async (data) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        DECLARE @idIdentCurrent INT;

        INSERT INTO insumoBodega(idInsumo, idBodega, cantidad, costo_Unitario, factura, marca, modelo, serie, proveedor, fechaCompra, descripcion)
        VALUES(${data.idInsumo}, ${data.idBodega}, ${data.cantidad}, ${data.costo_Unitario}, '${data.factura}', ${data.marca}, '${data.modelo}', '${data.serie}', ${data.proveedor}, '${data.fechaCompra}', '${data.descripcion}')

        SET @idIdentCurrent = IDENT_CURRENT('insumoBodega');

        INSERT INTO movimiento_Bodega_insumos(transaccion, cantidad, usuario, idInsumoBodega, usuariodestino, fecha, cantidadAnterior, descripcionAqueo, bodegaDestino )
        VALUES(1, ${data.cantidad}, ${data.usuario},  @idIdentCurrent, ${data.usuario}, '${data.fechaTranscion}', 0, 'Ingreso Inicial', ${data.idBodega} )

        SELECT @idIdentCurrent AS id
    `)
        cerrarConexion(pool)
        return (resultado.recordset[0])

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar Crear el Insumo' }
    }
}

const consultarCantidadInsumo = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT  ib.id, ib.cantidad, ib.idBodega, ib.idInsumoAuxiliar, TRIM(bo.bodega) AS bodega
            FROM insumoBodega ib
            INNER JOIN bodegas bo
            ON bo.id = ib.idBodega
        WHERE ib.id = ${id}


    `)
        cerrarConexion(pool)
        return (resultado.recordset[0])

    } catch (error) {
        console.error(error);
        return { msg: 'No fue posible Validar el Insumo en la Base de datos' }
    }
}

const consultarInsumoAuxiliar = async (idInsumo, idBodega) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT id, cantidad FROM insumoBodega 
        WHERE idInsumoAuxiliar = ${idInsumo} AND idBodega =  ${idBodega}

        SELECT id, cantidad FROM insumoBodega 
        WHERE id = ${idInsumo} AND idBodega =  ${idBodega}

    `)
        cerrarConexion(pool)
        return (resultado.recordsets)

    } catch (error) {
        console.error(error);
        return { msg: 'No fue posible Validar el movimiento en la base de datos' }
    }
}

const movimientoEntreBodegaInsumos = async (data, nuevo = false) => {

    let query
    if (nuevo) {
        query = `
            DECLARE @idNuevoInsumo INT;
                 
            INSERT INTO insumoBodega(idInsumo, idBodega, cantidad, FacturaPdf,costo_Unitario, descripcion,factura, marca, modelo,serie, proveedor, fechaCompra, imagen, idInsumoAuxiliar)
                SELECT idInsumo, ${data.bodegaDestino}, ${data.cantidad}, FacturaPdf,costo_Unitario, descripcion,factura, marca, modelo,serie, proveedor, fechaCompra, imagen, ${data.idAuxiliar}
                FROM insumoBodega
            WHERE id = ${data.idAuxiliar}
        
            -- Obtiene el último insumo insertado
            SET @idNuevoInsumo = IDENT_CURRENT('insumoBodega')
        
            INSERT INTO movimiento_Bodega_insumos(transaccion, cantidad, usuario, idInsumoBodega, usuariodestino, fecha, cantidadAnterior, descripcionAqueo, bodegaDestino)
            VALUES(${data.transaccion}, ${data.cantidad}, ${data.usuario}, @idNuevoInsumo, ${data.usuariodestino}, '${data.fecha}', ${data.cantidadAnterior},'${data.descripcionAqueo}', ${data.bodegaorigen})
        
            SELECT id, TRIM(FacturaPdf) AS FacturaPdf, TRIM(imagen) AS imagen, idInsumoAuxiliar
                FROM insumoBodega
            WHERE id = @idNuevoInsumo
    
        `
    } else {
        query = `
              -- Actualiza la tabla 'insumoBodega'
        UPDATE insumoBodega 
            SET cantidad = ${data.cantidadNueva}
        WHERE id = ${data.idInsumoBodega}

            -- Inserta datos en la tabla 'movimiento_Bodega_insumos'
        INSERT INTO movimiento_Bodega_insumos(transaccion, cantidad, usuario, idInsumoBodega, usuariodestino, fecha, cantidadAnterior, descripcionAqueo, bodegaDestino)
        VALUES(${data.transaccion}, ${data.cantidad}, ${data.usuario}, ${data.idInsumoBodega}, ${data.usuariodestino}, '${data.fecha}', ${data.cantidadAnterior},'${data.descripcionAqueo}', ${data.bodegaorigen})

    `
    }

    try {
        const pool = await conectardb()
        const resultado = await pool.query(query)
        cerrarConexion(pool)
        if (nuevo) return (resultado.recordset[0])
        return resultado.rowsAffected



    } catch (error) {
        console.error(error);
        return { msg: 'No fue posible realizar el movimiento en la base de datos' }
    }
}


const movimientoBodegaInsumos = async (data) => {

    let query

    query = `
        DECLARE @idIdentCurrent INT;

            -- Actualiza la tabla 'insumoBodega'
        UPDATE insumoBodega 
            SET cantidad = ${data.cantidadNueva}
        WHERE id = ${data.idInsumoBodega}

            -- Inserta datos en la tabla 'movimiento_Bodega_insumos'
        INSERT INTO movimiento_Bodega_insumos(transaccion, cantidad, usuario, idInsumoBodega, usuariodestino, fecha, cantidadAnterior, descripcionAqueo, bodegaDestino)
        VALUES(${data.transaccion}, ${data.cantidad}, ${data.usuario}, ${data.idInsumoBodega}, ${data.usuariodestino}, '${data.fecha}', ${data.cantidadAnterior},'${data.descripcionAqueo}', ${data.bodegaDestino})

            -- Obtiene el último ID insertado
        SET @idIdentCurrent = IDENT_CURRENT('movimiento_Bodega_insumos');

            -- Selecciona los datos requeridos utilizando el ID obtenido
        SELECT mbi.id AS idMovimiento,mbi.fecha AS fechaMovimiento, mbi.cantidad AS cantidadMovimiento, TRIM(mi.tipo) AS tipoMovimiento,
            mbi.descripcionAqueo AS observacionMovimiento, TRIM(bo.bodega) AS bodegaDestino,
            CONCAT(TRIM(us.nombre),SPACE(1), TRIM(us.nombre_1), SPACE(1), TRIM(us.apellido), SPACE(1), TRIM(us.apellido_1)) AS usuarioDestino,
            CONCAT(TRIM(usr.nombre),SPACE(1), TRIM(usr.nombre_1), SPACE(1), TRIM(usr.apellido), SPACE(1), TRIM(usr.apellido_1)) AS usuarioResponsable 	
            FROM movimiento_Bodega_insumos mbi
            INNER JOIN movimientoInsumos mi 
            ON mi.id = mbi.transaccion
            INNER JOIN bodegas bo
            ON bo.id = mbi.bodegaDestino
            INNER JOIN usuarios us 
            ON us.id = mbi.usuariodestino
            INNER JOIN usuarios usr
            ON usr.id = mbi.usuario
        WHERE mbi.id = @idIdentCurrent;
    `

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
		    TRIM(factura) AS factura, idBodega, marca, proveedor, TRIM(FacturaPdf) AS FacturaPdf,
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

const consultarInformeInsumos = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT ib.id AS id, TRIM(ib.modelo) AS modelo, TRIM(ib.serie) AS serie, ib.fechaCompra AS fechaCompra, ib.cantidad AS cantidad,
            TRIM(ib.imagen) AS imagen, TRIM(ib.factura) AS factura, ib.costo_Unitario, TRIM(ib.descripcion) AS descripcion,
            TRIM(ins.insumo) AS nombre,TRIM(bo.bodega) AS bodega, TRIM(ma.marca) AS marca,  TRIM(pro.razon_social) AS proveedor
            FROM insumoBodega ib
            INNER JOIN insumos ins
            ON ins.id = ib.idInsumo
            INNER JOIN bodegas bo
            ON bo.id = ib.idBodega
            INNER JOIN marca_activos ma
            ON ma.id = ib.marca
            INNER JOIN proveedores pro
            ON pro.id = ib.proveedor
        WHERE ib.id = ${id}

        SELECT mbi.id, mbi.cantidad, mbi.fecha, mbi.cantidadAnterior, mbi.descripcionAqueo, TRIM(mi.tipo) AS tipo,TRIM(bo.bodega) AS bodegaDestino,
            CONCAT(TRIM(us.nombre), SPACE(1), TRIM(us.nombre_1), sPACE(1), TRIM(us.apellido), sPACE(1), TRIM(us.apellido_1)) AS usuarioResponsable,
            CONCAT(TRIM(usd.nombre), SPACE(1), TRIM(usd.nombre_1), SPACE(1), TRIM(usd.apellido), SPACE(1), TRIM(usd.apellido_1)) AS usuarioDestino
            FROM movimiento_Bodega_insumos mbi
            INNER JOIN movimientoInsumos mi
            ON mi.id= mbi.transaccion
            INNER JOIN usuarios us
            ON us.id= mbi.usuario
            INNER JOIN usuarios usd
            ON usd.id= mbi.usuariodestino
			INNER JOIN bodegas bo
            ON bo.id= mbi.bodegaDestino
            WHERE mbi.idInsumoBodega = ${id}
        ORDER BY mbi.fecha
    `)
        cerrarConexion(pool)
        return (resultado.recordsets)

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los datos del insumo' }
    }
}
export {
    consultarlistasInsumo,
    consultarListadoInsumosBodega,
    consultarInsumosBodega,
    consultarCantidadInsumo,
    movimientoBodegaInsumos,
    datosValidarInsumo,
    actualizarInsumoBd,
    actualizarImagenInsumo,
    actualizarFacturaInsumo,
    consultarInformeInsumos,
    guardarInsumo,
    consultarInsumoAuxiliar,
    movimientoEntreBodegaInsumos
}